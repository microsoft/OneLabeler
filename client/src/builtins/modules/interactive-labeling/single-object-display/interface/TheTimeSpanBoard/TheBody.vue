<template>
  <div
    ref="container"
    style="display: flex; flex-direction: column"
  >
    <!-- The data object display. -->
    <component
      :is="component"
      ref="display"
      :data-object="dataObject"
      :label="label"
      :label2color="label2color"
      style="flex: 1 1 70%"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
    />

    <!-- The annotated time spans. -->
    <TheTimeSpanAnnotation
      v-if="includesSpanClassification"
      :duration="duration"
      :current-time="currentTime"
      :slot-client-x-range="slotClientXRange"
      :category-tasks="categoryTasks"
      :selected-slot="selectedSlot"
      :spans="spans"
      :selected-span="selectedSpan"
      :label2color="label2color"
      style="flex: 1 1 30%"
      @create:span="$emit('create:span', $event)"
      @select:span="onSelectSpan"
      @update:span="$emit('update:span', $event)"
      @select:slot="$emit('select:slot', $event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import type {
  ComponentInstance,
  PropType,
  Ref,
} from '@vue/composition-api';
import type { VueConstructor } from 'vue';
import { LabelTaskType } from '@/commons/types';
import type {
  Category,
  DataType,
  IMedia,
  ILabel,
  ILabelTimeSpan,
} from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';
import { useResizeObserver } from '@/components/composables/useResize';
import TheTimeSpanAnnotation from './TheTimeSpanAnnotation.vue';

type XRange = { left: number, width: number };
type MediaDisplay = ComponentInstance & {
  getProgress: () => HTMLProgressElement,
  getMedia: () => HTMLMediaElement,
} | null;

const useSlotClientXRange = (
  container: Ref<HTMLDivElement | null>,
  display: Ref<MediaDisplay>,
) => {
  const slotClientXRange: Ref<XRange | null> = ref(null);
  const getProgress = (): HTMLProgressElement | null => (
    display.value?.getProgress() ?? null
  );
  const getSlotClientXRange = (): XRange | null => {
    const progress = getProgress();
    if (progress === null) return null;
    const rect = progress.getBoundingClientRect();
    return { left: rect.x, width: rect.width };
  };
  useResizeObserver(container, () => {
    slotClientXRange.value = getSlotClientXRange();
  });
  return { slotClientXRange };
};

export default defineComponent({
  name: 'TheTimeSpanBoardBody',
  components: { TheTimeSpanAnnotation },
  props: {
    dataType: {
      type: String as PropType<DataType>,
      // In case the interface is created before data type is selected.
      default: null,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    dataObject: {
      type: Object as PropType<IMedia>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
      required: true,
    },
    selectedSlot: {
      type: String as PropType<Category | null>,
      default: null,
    },
    selectedSpan: {
      type: Object as PropType<ILabelTimeSpan | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  emits: {
    'create:span': null,
    'update:span': null,
    'select:slot': null,
    'select:span': null,
  },
  setup() {
    const container: Ref<HTMLDivElement | null> = ref(null);
    const display: Ref<MediaDisplay> = ref(null);
    const { slotClientXRange } = useSlotClientXRange(container, display);
    return {
      container,
      display,
      slotClientXRange,
    };
  },
  data() {
    return {
      currentTime: 0,
      loadedDuration: null as number | null,
    };
  },
  computed: {
    includesSpanClassification(): boolean {
      return this.labelTasks.includes(LabelTaskType.SpanClassification);
    },
    component(): VueConstructor | null {
      return dataTypeSetups.find((d) => d.type === this.dataType)?.display ?? null;
    },
    spans(): ILabelTimeSpan[] | null {
      return this.label?.spans ?? null;
    },
    duration(): number {
      if (this.dataObject.duration) return this.dataObject.duration;
      if (this.loadedDuration !== null) return this.loadedDuration;
      return 0;
    },
  },
  methods: {
    onSelectSpan(span: ILabelTimeSpan | null): void {
      this.$emit('select:span', span);
      if (span !== null) this.setMediaCurrentTime(span.start);
    },
    onTimeUpdate(e: Event): void {
      const media = e.target as HTMLMediaElement;
      this.currentTime = media.currentTime;
      // Loop on the selected span.
      if (this.selectedSpan !== null && this.currentTime >= this.selectedSpan.end) {
        this.setMediaCurrentTime(this.selectedSpan.start);
      }
    },
    onLoadedMetadata(e: Event): void {
      const media = e.target as HTMLMediaElement;
      this.loadedDuration = media.duration;
    },
    setMediaCurrentTime(time: number): void {
      const component = this.$refs.display as MediaDisplay;
      if (component === null) return;
      const media = component.getMedia();
      media.currentTime = time;
    },
  },
});
</script>

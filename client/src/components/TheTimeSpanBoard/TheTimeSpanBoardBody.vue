<template>
  <div
    ref="container"
    style="display: flex; flex-direction: column"
  >
    <!-- The data object display. -->
    <component
      :is="component"
      ref="dataObject"
      :data-object="dataObject"
      :label="label"
      :label2color="label2color"
      :height="includesSpanClassification ? '70%' : '100%'"
      :width="'100%'"
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
      style="flex: 1 1 auto"
      @create:span="$emit('create:span', $event)"
      @select:span="onSelectSpan"
      @update:span="$emit('update:span', $event)"
      @select:slot="$emit('select:slot', $event)"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import {
  Category,
  DataType,
  IMedia,
  ILabel,
  ILabelTimeSpan,
  LabelTaskType,
} from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';
import TheTimeSpanAnnotation from './TheTimeSpanAnnotation.vue';

export default Vue.extend({
  name: 'TheTimeSpanBoardBody',
  components: { TheTimeSpanAnnotation },
  props: {
    dataType: {
      type: String as PropType<DataType>,
      required: true,
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
  data() {
    return {
      resizeObserver: null as ResizeObserver | null,
      currentTime: 0,
      slotClientXRange: null as { left: number, width: number } | null,
      loadedDuration: null as number | null,
    };
  },
  computed: {
    includesSpanClassification(): boolean {
      return this.labelTasks.includes(LabelTaskType.SpanClassification);
    },
    component(): VueConstructor | null {
      const { dataType } = this;
      const dataTypeSetup = dataTypeSetups.find((d) => d.type === dataType);
      return dataTypeSetup?.display ?? null;
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
  mounted() {
    this.slotClientXRange = this.getSlotClientXRange();
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.$refs.container as HTMLElement);
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
    onResize(): void {
      this.slotClientXRange = this.getSlotClientXRange();
    },
    setMediaCurrentTime(time: number): void {
      const component = this.$refs.dataObject as Vue & {
        getMedia: () => HTMLMediaElement,
      };
      const media = component.getMedia();
      media.currentTime = time;
    },
    getProgress(): HTMLProgressElement | null {
      const component = this.$refs.dataObject as Vue & {
        getProgress: () => HTMLProgressElement,
      } | undefined;
      return component?.getProgress() ?? null;
    },
    getSlotClientXRange(): { left: number, width: number } | null {
      const progress = this.getProgress();
      if (progress === null) return null;
      const rect = progress.getBoundingClientRect();
      return { left: rect.left, width: rect.width };
    },
  },
});
</script>

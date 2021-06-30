<template>
  <div
    ref="container"
    style="width: 100%; display: flex; flex-direction: column"
  >
    <!-- The data object display. -->
    <component
      :is="component"
      ref="dataObject"
      :data-object="dataObject"
      :label="label"
      :label2color="label2color"
      :height="'70%'"
      :width="'100%'"
      class="px-2"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
    />

    <!-- The annotated time spans. -->
    <TheTimeSpanAnnotation
      :duration="duration"
      :current-time="currentTime"
      :slot-client-x-range="slotClientXRange"
      :classes="classes"
      :selected-slot="selectedSlot"
      :spans="spans"
      :selected-span="selectedSpan"
      :label2color="label2color"
      class="ma-2"
      style="flex: 1 1 auto"
      @create:span="onCreateSpan"
      @select:span="onSelectSpan"
      @update:span="onUpdateSpan"
      @select:slot="onSelectSlot"
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
    dataObject: {
      type: Object as PropType<IMedia>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    classes: {
      type: Array as PropType<Category[]>,
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
    component(): VueConstructor | null {
      const { dataType } = this;
      const dataTypeSetup = dataTypeSetups.find((d) => d.type === dataType);
      if (dataTypeSetup === undefined) return null;
      return dataTypeSetup.display;
    },
    spans(): ILabelTimeSpan[] | null {
      const { label } = this;
      if (label === null) return null;
      if (label.spans === null || label.spans === undefined) return null;
      return label.spans;
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
    onUpdateSpan(newValue: ILabelTimeSpan): void {
      this.$emit('update:span', newValue);
    },
    onCreateSpan(span: ILabelTimeSpan): void {
      this.$emit('create:span', span);
    },
    onSelectSpan(span: ILabelTimeSpan | null): void {
      this.$emit('select:span', span);
      if (span !== null) this.setMediaCurrentTime(span.start);
    },
    onSelectSlot(category: Category | null): void {
      this.$emit('select:slot', category);
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
      if (component === undefined) return null;
      return component.getProgress();
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

<template>
  <div
    ref="container"
    style="width: 100%; display: flex; flex-direction: column"
  >
    <!-- The content of the data object. -->
    <div
      ref="content"
      class="px-2"
      style="width: 100%; height: 70%;"
    >
      <component
        :is="component"
        ref="dataObject"
        :data-object="dataObject"
        :label="label"
        :label2color="label2color"
        :height="'100%'"
        :width="'100%'"
        @timeupdate="onTimeUpdate"
      />
    </div>

    <!-- The annotated spans. -->
    <v-card
      ref="annotations"
      v-click-outside="onClickOutside"
      class="pa-0 ma-2"
      style="flex: 1 1 auto; overflow-y: scroll; border-radius: 0"
    >
      <div
        v-for="(category, i) in classes"
        :key="`slot-${i}`"
        class="my-1"
        :style="{
          'height': '40px',
          'display': 'flex',
          'align-items': 'center',
        }"
      >
        <span
          class="subtitle-2 px-2"
          style="width: 15%"
        >
          {{ category }}
        </span>
        <div
          :style="{
            'flex': '1 1 auto',
            'height': '100%',
            display: 'flex',
          }"
          @click="onSelectSlot(category)"
        >
          <!-- The slot. -->
          <div
            :style="{
              position: 'absolute',
              width: `${slotXRange.width}px`,
              height: '40px',
              left: `${slotXRange.left}px`,
              border: `${label2color(category)} 1px solid`,
              'background-color': selectedSlot === category ? '#ddd' : undefined,
            }"
          >
            <!-- The label spans. -->
            <template v-for="(span, i) in labelSpans">
              <div
                v-if="span.category === category"
                :key="`span-${i}`"
                :style="{
                  position: 'absolute',
                  width: `${100 * (span.end - span.start) / duration}%`,
                  height: `calc(100% - ${margin * 2}px)`,
                  left: `${100 * span.start / duration}%`,
                  top: `${margin}px`,
                  'background-color': getBoxColor(category),
                  'border': isSpanSelected(span) ? 'gray 3px solid' : undefined,
                }"
                @click="onSelectLabelSpan(span)"
              />
            </template>

            <!-- The newly created span. -->
            <div
              v-if="newSpan !== null && newSpan.category === category"
              :style="{
                position: 'absolute',
                width: `${100 * (newSpan.end - newSpan.start) / duration}%`,
                height: `calc(100% - ${margin * 2}px)`,
                left: `${100 * newSpan.start / duration}%`,
                top: `${margin}px`,
                'background-color': getBoxColor(category),
                'border': 'red 3px solid',
              }"
            />
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { color as d3color } from 'd3';
import {
  Category,
  DataType,
  IMedia,
  ILabel,
  ILabelTimeSpan,
} from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';

export default Vue.extend({
  name: 'TheTimeSpanBoardBody',
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
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  data() {
    return {
      selectedSlot: null as Category | null,
      selectedSpan: null as ILabelTimeSpan | null,
      newSpan: null as ILabelTimeSpan | null,
      resizeObserver: null as ResizeObserver | null,
      currentTime: 0,
      margin: 5,
      slotXRange: { left: 0, width: 0 },
    };
  },
  computed: {
    component(): VueConstructor | null {
      const { dataType } = this;
      const dataTypeSetup = dataTypeSetups.find((d) => d.type === dataType);
      if (dataTypeSetup === undefined) return null;
      return dataTypeSetup.display;
    },
    labelSpans(): ILabelTimeSpan[] | null {
      const { label } = this;
      if (label === null) return null;
      if (label.spans === null || label.spans === undefined) return null;
      return label.spans;
    },
    duration(): number {
      return this.dataObject.duration;
    },
  },
  watch: {
    dataObject() {
      this.selectedSlot = null;
    },
  },
  created(): void {
    // Bind keyboard events.
    window.addEventListener('keydown', this.onKey);
  },
  beforeDestroy(): void {
    // Remove listener before distroy,
    // otherwise the onKey method will be called multiple times.
    window.removeEventListener('keydown', this.onKey);
  },
  async mounted() {
    await this.$nextTick();
    this.slotXRange = this.getSlotXRange();
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.$refs.container as HTMLElement);
  },
  methods: {
    onKey(e: KeyboardEvent): void {
      const { key } = e;
      this.getSlotXRange();
      // shortcut for start creating span: a
      if (key === 'a') {
        this.onStartCreateSpan();
      }
      // shortcut for end creating span: d
      if (key === 'd') {
        this.onEndCreateSpan();
      }
    },
    onClickOutside(): void {
      // Unselect slot.
      this.onSelectSlot(null);
      // Unselect label span.
      this.onSelectLabelSpan(null);
    },
    onTimeUpdate(e: Event): void {
      const media = e.target as HTMLMediaElement;
      this.currentTime = media.currentTime;
      if (this.newSpan !== null) {
        this.newSpan.end = this.currentTime;
      }

      // Loop on the selected span.
      if (this.selectedSpan !== null && this.currentTime >= this.selectedSpan.end) {
        this.setMediaCurrentTime(this.selectedSpan.start);
      }
    },
    onStartCreateSpan(): void {
      if (this.newSpan !== null) {
        this.onEndCreateSpan();
      }
      const category: Category | null = this.selectedSlot;
      if (category === null) return;
      const start: number = this.currentTime;
      const end: number = start;
      const span: ILabelTimeSpan = {
        start,
        end,
        category,
        uuid: uuidv4(),
      };
      this.newSpan = span;
    },
    onEndCreateSpan(): void {
      const span = this.newSpan;
      if (span === null) return;
      span.end = this.currentTime;
      if (span.start === span.end) return;
      this.$emit('create:span', span);
      this.newSpan = null;
    },
    onSelectLabelSpan(span: ILabelTimeSpan | null): void {
      this.$emit('select:span', span);
      this.selectedSpan = span;
      if (span !== null) this.setMediaCurrentTime(span.start);
    },
    onSelectSlot(category: Category | null): void {
      this.$emit('select:slot', category);
      this.selectedSlot = category;
    },
    onResize(): void {
      this.slotXRange = this.getSlotXRange();
    },
    isSpanSelected(span: ILabelTimeSpan): boolean {
      const { selectedSpan } = this;
      return (selectedSpan !== null)
        && (selectedSpan.uuid === span.uuid);
    },
    setMediaCurrentTime(time: number): void {
      const component = this.$refs.dataObject as Vue & {
        getMedia: () => HTMLMediaElement,
      };
      const media = component.getMedia();
      media.currentTime = time;
    },
    getProgress(): HTMLProgressElement {
      const component = this.$refs.dataObject as Vue & {
        getProgress: () => HTMLProgressElement,
      };
      return component.getProgress();
    },
    getSlotXRange(): { left: number, width: number } {
      const progress = this.getProgress();
      const annotations = (this.$refs.annotations as Vue).$el as HTMLElement;
      const progressBox = progress.getBoundingClientRect();
      const annotationsBox = annotations.getBoundingClientRect();
      return {
        left: progressBox.x - annotationsBox.x,
        width: progressBox.width,
      };
    },
    getBoxColor(category: Category): string {
      const { label2color } = this;
      const color = d3color(label2color(category));
      if (color === null) return 'black';
      const { r, g, b } = color.rgb();
      return `rgba(${r}, ${g}, ${b}, 0.5)`;
    },
  },
});
</script>

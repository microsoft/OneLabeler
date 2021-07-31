<template>
  <v-card
    ref="container"
    v-click-outside="onClickOutside"
    style="overflow-y: scroll; border-radius: 0;"
  >
    <div
      v-for="(category, i) in classesFiltered"
      :key="`slot-${i}`"
      class="my-1"
      :style="{
        'height': '40px',
        'display': 'flex',
        'align-items': 'center',
      }"
    >
      <span class="subtitle-2 px-2">
        {{ category }}
      </span>

      <!-- The slot for a label category. -->
      <div
        :style="{
          position: 'absolute',
          width: `${slotXRange.width}px`,
          height: '40px',
          left: `${slotXRange.left}px`,
          border: `${label2color(category)} 1px solid`,
          'background-color': selectedSlot === category ? '#ddd' : undefined,
        }"
        @click="onSelectSlot(category)"
        @mousedown="onMouseDownSlot"
        @mousemove="onMouseMoveSlot"
        @mouseup="onMouseUpSlot"
        @mouseleave="onMouseLeaveSlot"
      >
        <!-- The labeled spans. -->
        <template v-if="spans !== null">
          <template v-for="(span, j) in spans">
            <div
              v-if="span.category === category"
              :key="`span-${j}`"
            >
              <div
                :style="{
                  position: 'absolute',
                  width: `${100 * (span.end - span.start) / duration}%`,
                  height: `calc(100% - ${margin * 2}px)`,
                  left: `${100 * span.start / duration}%`,
                  top: `${margin}px`,
                  'background-color': getSpanColor(category),
                  'border': isSpanSelected(span) ? 'gray 3px solid' : undefined,
                }"
                @click="onSelectSpan(span)"
              />
              <!-- The handles for duration editing. -->
              <template v-if="isSpanSelected(span)">
                <div
                  v-for="handle in getHandles(span)"
                  :key="`span-${j}-handle-${handle.direction}`"
                  :style="{
                    position: 'absolute',
                    width: `15px`,
                    height: `calc(100% - ${margin * 2}px)`,
                    left: handle.direction === HandleDirection.Left
                      ? `calc(${100 * span.start / duration}% - 7.5px)`
                      : `calc(${100 * span.end / duration}% - 7.5px)`,
                    top: `${margin}px`,
                    cursor: 'ew-resize',
                  }"
                  @mousedown="onMouseDownHandle(handle, $event)"
                />
              </template>
            </div>
          </template>
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
            'background-color': getSpanColor(category),
            'border': 'red 3px solid',
          }"
        />
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { color as d3color } from 'd3';
import { Category, ILabelTimeSpan, LabelTaskType } from '@/commons/types';

interface Point {
  x: number;
  y: number;
}

enum HandleDirection {
  Left = 'Left',
  Right = 'Right',
}

/**
 * The handle on a span.
 * @apiNote Store spanUuid instead of a span object to
 * avoid the need to explicitly synchronizing the span
 * after editing the span.
 */
interface SpanHandle {
  /** The uuid of the span containing the handle. */
  spanUuid: string;
  /** The direction of the handle in the span. */
  direction: HandleDirection;
}

export default Vue.extend({
  name: 'TheTimeSpanAnnotation',
  props: {
    duration: {
      type: Number as PropType<number>,
      required: true,
    },
    currentTime: {
      type: Number as PropType<number>,
      required: true,
    },
    slotClientXRange: {
      type: Object as PropType<{ left: number, width: number } | null>,
      default: null,
    },
    classes: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
      required: true,
    },
    selectedSlot: {
      type: String as PropType<Category | null>,
      default: null,
    },
    spans: {
      type: Array as PropType<ILabelTimeSpan[] | null>,
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
      draggedSpanHandle: null as SpanHandle | null,
      dragLastPoint: null as Point | null,
      newSpan: null as ILabelTimeSpan | null,
      resizeObserver: null as ResizeObserver | null,
      margin: 5,
      containerClientX: null as number | null,
      HandleDirection,
      LabelTaskType,
    };
  },
  computed: {
    slotXRange(): { left: number, width: number } {
      if (this.slotClientXRange === null) return { left: 0, width: 0 };
      if (this.containerClientX === null) return this.slotClientXRange;
      return {
        left: this.slotClientXRange.left - this.containerClientX,
        width: this.slotClientXRange.width,
      };
    },
    classesFiltered(): Category[] {
      return this.filterClassesByLabelTask(LabelTaskType.SpanClassification);
    },
  },
  watch: {
    currentTime() {
      const { currentTime } = this;
      if (this.newSpan !== null) {
        this.newSpan.end = Math.max(this.newSpan.start, currentTime);
      }
    },
    classesFiltered() {
      // If the category the new span belongs to has been deleted,
      // remove the new span.
      if (this.newSpan !== null
        && !this.classesFiltered.includes(this.newSpan.category)) {
        this.newSpan = null;
      }
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
  mounted() {
    this.containerClientX = this.getContainerClientX();
    const container = this.getContainer();
    if (container !== null) {
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(container);
    }
  },
  methods: {
    onMouseDownHandle(handle: SpanHandle): void {
      this.draggedSpanHandle = handle;
    },
    onMouseDownSlot(e: MouseEvent): void {
      this.dragLastPoint = { x: e.clientX, y: e.clientY };
    },
    onMouseMoveSlot(e: MouseEvent): void {
      const {
        dragLastPoint,
        draggedSpanHandle,
        duration,
        spans,
      } = this;
      const mousePoisition = { x: e.clientX, y: e.clientY };
      if (dragLastPoint !== null
        && draggedSpanHandle !== null
        && spans !== null
      ) {
        const span = spans.find((d) => d.uuid === draggedSpanHandle.spanUuid);
        if (span !== undefined) {
          const newValue = { ...span };
          const dx = mousePoisition.x - dragLastPoint.x;
          const dt = (this.duration * dx) / this.slotXRange.width;
          if (draggedSpanHandle.direction === HandleDirection.Left) {
            newValue.start = Math.max(newValue.start + dt, 0);
          } else if (draggedSpanHandle.direction === HandleDirection.Right) {
            newValue.end = Math.min(newValue.end + dt, duration);
          }
          this.$emit('update:span', newValue);
        }
      }
      this.dragLastPoint = mousePoisition;
    },
    onMouseUpSlot(): void {
      this.dragLastPoint = null;
      this.draggedSpanHandle = null;
    },
    onMouseLeaveSlot(): void {
      this.dragLastPoint = null;
      this.draggedSpanHandle = null;
    },
    onKey(e: KeyboardEvent): void {
      const { key } = e;
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
      this.onSelectSpan(null);
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
      if (this.currentTime >= span.start) span.end = this.currentTime;
      if (span.start === span.end) return;
      this.$emit('create:span', span);
      this.newSpan = null;
    },
    onSelectSpan(span: ILabelTimeSpan | null): void {
      this.$emit('select:span', span);
    },
    onSelectSlot(category: Category | null): void {
      this.$emit('select:slot', category);
    },
    onResize(): void {
      this.containerClientX = this.getContainerClientX();
    },
    isSpanSelected(span: ILabelTimeSpan): boolean {
      const { selectedSpan } = this;
      return (selectedSpan !== null)
        && (selectedSpan.uuid === span.uuid);
    },
    getHandles(span: ILabelTimeSpan): SpanHandle[] {
      return [
        { spanUuid: span.uuid, direction: HandleDirection.Left },
        { spanUuid: span.uuid, direction: HandleDirection.Right },
      ];
    },
    getContainer(): HTMLElement | null {
      const container = this.$refs.container as Vue | undefined;
      if (container === undefined) return null;
      return container.$el as HTMLElement;
    },
    getContainerClientX(): number | null {
      const container = this.getContainer();
      if (container === null) return null;
      const rect = container.getBoundingClientRect();
      return rect.x;
    },
    getSpanColor(category: Category): string {
      const { label2color } = this;
      const color = d3color(label2color(category));
      if (color === null) return 'black';
      const { r, g, b } = color.rgb();
      return `rgba(${r}, ${g}, ${b}, 0.5)`;
    },
    filterClassesByLabelTask(labelTask: LabelTaskType): Category[] {
      const { categoryTasks } = this;
      const classesFiltered: Category[] = Object.entries(categoryTasks)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([category, usedInTasks]) => (
          usedInTasks === null || usedInTasks.includes(labelTask)
        )).map((d) => d[0]);
      return classesFiltered;
    },
  },
});
</script>

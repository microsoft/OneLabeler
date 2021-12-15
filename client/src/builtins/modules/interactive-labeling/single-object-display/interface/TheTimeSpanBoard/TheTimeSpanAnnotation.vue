<template>
  <!-- Note: need position relative to ensure the
    descendent elements with position: absolute will not overflow -->
  <div
    ref="container"
    :style="styleCardElevated"
    style="overflow-y: scroll; position: relative;"
  >
    <div
      v-for="(category, i) in categories"
      :key="`slot-${i}`"
      class="my-1"
      style="height: 40px; display: flex; align-items: center;"
    >
      <span class="subtitle-2 px-2">
        {{ category }}
      </span>

      <!-- The slot for a label category. -->
      <div
        style="position: absolute; height: 40px;"
        :style="{
          width: `${slotXRange.width}px`,
          left: `${slotXRange.left}px`,
          border: `${label2color(category)} 1px solid`,
          'background-color': selectedSlot === category ? '#ddd' : undefined,
        }"
        @click="$emit('select:slot', category)"
        @mousedown="dragLastPoint = { x: $event.clientX, y: $event.clientY }"
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
                  border: isSpanSelected(span) ? 'gray 3px solid' : undefined,
                }"
                @click="$emit('select:span', span)"
              />
              <!-- The handles for duration editing. -->
              <template v-if="isSpanSelected(span)">
                <div
                  v-for="handle in getHandles(span)"
                  :key="`span-${j}-handle-${handle.direction}`"
                  style="position: absolute; width: 15px; cursor: ew-resize;"
                  :style="{
                    height: `calc(100% - ${margin * 2}px)`,
                    left: handle.direction === HandleDirection.Left
                      ? `calc(${100 * span.start / duration}% - 7.5px)`
                      : `calc(${100 * span.end / duration}% - 7.5px)`,
                    top: `${margin}px`,
                  }"
                  @mousedown="draggedSpanHandle = handle"
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
            border: 'red 3px solid',
          }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  toRefs,
  watch,
} from '@vue/composition-api';
import type {
  PropType,
  Ref,
  SetupContext,
} from '@vue/composition-api';
import { v4 as uuidv4 } from 'uuid';
import { color as d3color } from 'd3';
import {
  onClickOutside,
  onKeyDown,
  useResizeObserver,
} from '@vueuse/core';
import { LabelTaskType } from '@/commons/types';
import type { Category, ILabelTimeSpan } from '@/commons/types';
import { cardElevated as styleCardElevated } from '@/style';

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

const getHandles = (span: ILabelTimeSpan): SpanHandle[] => [
  { spanUuid: span.uuid, direction: HandleDirection.Left },
  { spanUuid: span.uuid, direction: HandleDirection.Right },
];

// Get the relevant label categories.
const useCategories = (
  categoryTasks: Ref<Record<Category, LabelTaskType[] | null>>,
) => {
  const labelTask = LabelTaskType.SpanClassification;
  const categories = computed(() => (
    Object.entries(categoryTasks.value)
      .filter(([, usedInTasks]) => (
        usedInTasks === null || usedInTasks.includes(labelTask)
      )).map((d) => d[0])
  ));
  return categories;
};

// Get the currently created label span.
const useCreateSpan = (
  currentTime: Ref<number>,
  selectedSlot: Ref<string | null>,
  categories: Ref<string[]>,
  emit: SetupContext['emit'],
) => {
  const newSpan: Ref<ILabelTimeSpan | null> = ref(null);
  const endCreateSpan = (): void => {
    if (newSpan.value === null) return;
    if (currentTime.value >= newSpan.value.start) newSpan.value.end = currentTime.value;
    if (newSpan.value.start === newSpan.value.end) return;
    emit('create:span', newSpan.value);
    newSpan.value = null;
  };
  const startCreateSpan = (): void => {
    if (newSpan.value !== null) {
      endCreateSpan();
    }
    const category: Category | null = selectedSlot.value;
    if (category === null) return;
    const start: number = currentTime.value;
    const end: number = start;
    const span: ILabelTimeSpan = {
      start,
      end,
      category,
      uuid: uuidv4(),
    };
    newSpan.value = span;
  };

  // Press 'a' to start creating span.
  onKeyDown('a', startCreateSpan);
  // Press 'd' to end creating span.
  onKeyDown('d', endCreateSpan);

  watch(currentTime, () => {
    if (newSpan.value !== null) {
      newSpan.value.end = Math.max(newSpan.value.start, currentTime.value);
    }
  });
  watch(categories, () => {
    // If the category the new span belongs to has been deleted,
    // remove the new span.
    const isDeleted = newSpan.value !== null
      && !categories.value.includes(newSpan.value.category);
    if (isDeleted) newSpan.value = null;
  });

  return newSpan;
};

// Get the allocated position for the slots.
const useSlotXRange = (
  container: Ref<HTMLElement | null>,
  slotClientXRange: Ref<{ left: number, width: number } | null>,
) => {
  const containerClientX: Ref<number | null> = ref(null);
  onMounted(() => {
    containerClientX.value = container
      .value?.getBoundingClientRect().x ?? null;
  });
  useResizeObserver(container, () => {
    containerClientX.value = container
      .value?.getBoundingClientRect().x ?? null;
  });
  const slotXRange = computed(() => {
    if (slotClientXRange.value === null) return { left: 0, width: 0 };
    if (containerClientX.value === null) return slotClientXRange.value;
    return {
      left: slotClientXRange.value.left - containerClientX.value,
      width: slotClientXRange.value.width,
    };
  });
  return slotXRange;
};

export default defineComponent({
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
  emits: {
    'update:span': null,
    'create:span': null,
    'select:span': null,
    'select:slot': null,
  },
  setup(props, { emit }) {
    const { categoryTasks } = toRefs(props);
    const categories = useCategories(categoryTasks);

    const { currentTime, selectedSlot } = toRefs(props);
    const newSpan = useCreateSpan(
      currentTime,
      selectedSlot,
      categories,
      emit,
    );

    const { slotClientXRange } = toRefs(props);
    const container: Ref<HTMLElement | null> = ref(null);
    const slotXRange = useSlotXRange(
      container,
      slotClientXRange,
    );

    onClickOutside(container, () => {
      // Unselect slot.
      emit('select:slot', null);
      // Unselect label span.
      emit('select:span', null);
    });

    return {
      newSpan,
      categories,
      container,
      slotXRange,
    };
  },
  data() {
    return {
      styleCardElevated,
      draggedSpanHandle: null as SpanHandle | null,
      dragLastPoint: null as Point | null,
      margin: 5,
      HandleDirection,
    };
  },
  methods: {
    onMouseMoveSlot(e: MouseEvent): void {
      const {
        dragLastPoint,
        draggedSpanHandle,
        duration,
        spans,
      } = this;
      const mousePosition = { x: e.clientX, y: e.clientY };
      if (dragLastPoint !== null
        && draggedSpanHandle !== null
        && spans !== null
      ) {
        const span = spans.find((d) => d.uuid === draggedSpanHandle.spanUuid);
        if (span !== undefined) {
          const newValue = { ...span };
          const dx = mousePosition.x - dragLastPoint.x;
          const dt = (this.duration * dx) / this.slotXRange.width;
          if (draggedSpanHandle.direction === HandleDirection.Left) {
            newValue.start = Math.max(newValue.start + dt, 0);
          } else if (draggedSpanHandle.direction === HandleDirection.Right) {
            newValue.end = Math.min(newValue.end + dt, duration);
          }
          this.$emit('update:span', newValue);
        }
      }
      this.dragLastPoint = mousePosition;
    },
    onMouseUpSlot(): void {
      this.dragLastPoint = null;
      this.draggedSpanHandle = null;
    },
    onMouseLeaveSlot(): void {
      this.dragLastPoint = null;
      this.draggedSpanHandle = null;
    },
    isSpanSelected(span: ILabelTimeSpan): boolean {
      const { selectedSpan } = this;
      return (selectedSpan !== null)
        && (selectedSpan.uuid === span.uuid);
    },
    getHandles,
    getSpanColor(category: Category): string {
      const { label2color } = this;
      const color = d3color(label2color(category));
      if (color === null) return 'black';
      const { r, g, b } = color.rgb();
      return `rgba(${r}, ${g}, ${b}, 0.5)`;
    },
  },
});
</script>

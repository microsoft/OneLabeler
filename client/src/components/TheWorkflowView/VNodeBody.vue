<template>
  <g>
    <polygon
      v-if="isDecision"
      :points="`
        ${width / 2},0
        ${width},${height / 2}
        ${width / 2},${height}
        0,${height / 2}`"
      stroke="currentColor"
      fill="white"
      stroke-width="1"
    />
    <rect
      v-else-if="isExit || isInit"
      :width="width"
      :height="height"
      :rx="Math.min(width, height) / 2"
      :ry="Math.min(width, height) / 2"
      stroke="currentColor"
      fill="white"
      stroke-width="1"
    />
    <rect
      v-else
      :width="width"
      :height="height"
      fill="white"
    />

    <!-- The frame. -->
    <rect
      :width="width"
      :height="height"
      stroke="currentColor"
      fill="none"
      stroke-width="1"
    />
  </g>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { WorkflowNodeType } from '@/commons/types';

export default defineComponent({
  name: 'VNodeBody',
  props: {
    type: {
      type: String as PropType<WorkflowNodeType | null>,
      default: null,
    },
    width: {
      type: Number as PropType<number>,
      required: true,
    },
    height: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  data() {
    return { cellSize: 20 };
  },
  computed: {
    isInit(): boolean {
      return this.type === WorkflowNodeType.Initialization;
    },
    isDecision(): boolean {
      return this.type === WorkflowNodeType.Decision;
    },
    isExit(): boolean {
      return this.type === WorkflowNodeType.Exit;
    },
  },
});
</script>

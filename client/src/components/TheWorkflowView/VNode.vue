<template>
  <g>
    <template v-if="isInitialization || isModule">
      <VNodeModule :node="node" />
    </template>
    <template v-else>
      <template v-if="isDecision">
        <polygon
          :points="`
            ${node.width / 2},0
            ${node.width},${node.height / 2}
            ${node.width / 2},${node.height}
            0,${node.height / 2}`"
          stroke="currentColor"
          fill="white"
          stroke-width="1"
        />
      </template>
      <template v-else-if="isExit">
        <circle
          :r="node.height / 2"
          :cx="node.width / 2"
          :cy="node.height / 2"
          stroke="currentColor"
          fill="white"
          stroke-width="1"
        />
      </template>

      <!-- The text label of the node. -->
      <text
        :y="node.height / 2"
        font-size="14px"
        dominant-baseline="middle"
        text-anchor="middle"
        style="user-select: none; pointer-events: none;"
      >
        <tspan
          v-for="(d, i) in node.label.split(' ')"
          :key="i"
          :x="node.width / 2"
          :dy="i === 0
            ? `${-(node.label.split(' ').length - 1) * 0.6}em`
            : '1.2em'
          "
        >
          {{ d }}
        </tspan>
      </text>
    </template>

    <!-- A spinner denoting the module is currently executing. -->
    <g
      v-if="isExecuting"
      :transform="`translate(
      ${node.width > node.height ? (node.width - node.height) / 2 : 0},
      ${node.height > node.width ? (node.height - node.width) / 2 : 0})`"
    >
      <IconAnimatedSpinner
        :width="Math.min(node.width, node.height)"
        :height="Math.min(node.width, node.height)"
        color="#93BFEC"
      />
    </g>
  </g>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowNode } from '@/commons/types';
import { isNodeModule } from '@/commons/utils';
import IconAnimatedSpinner from '@/plugins/icons/IconAnimatedSpinner.vue';
import type { FlowchartNode } from '../VFlowchart/types';
import VNodeModule from './VNodeModule.vue';

export default defineComponent({
  name: 'VNode',
  components: { VNodeModule, IconAnimatedSpinner },
  props: {
    node: {
      type: Object as PropType<WorkflowNode & FlowchartNode>,
      default: null,
    },
    /** Whether the node is currently executed. */
    isExecuting: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  computed: {
    isDecision(): boolean {
      return this.node.type === WorkflowNodeType.Decision;
    },
    isExit(): boolean {
      return this.node.type === WorkflowNodeType.Exit;
    },
    isInitialization(): boolean {
      return this.node.type === WorkflowNodeType.Initialization;
    },
    isModule(): boolean {
      return isNodeModule(this.node);
    },
  },
});
</script>

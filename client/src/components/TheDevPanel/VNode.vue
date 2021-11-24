<template>
  <g @contextmenu.stop="$emit('contextmenu:node', node, $event)">
    <template v-if="isInitialization || isProcess">
      <VNodeProcess
        :node="node"
        :is-executing="isExecuting"
        :is-selected="isSelected"
      />
    </template>
    <template v-else>
      <template v-if="isDecision">
        <polygon
          :points="`
            ${node.width / 2},0
            ${node.width},${node.height / 2}
            ${node.width / 2},${node.height}
            0,${node.height / 2}`"
          :stroke="isSelected
            ? 'black'
            : (isExecuting ? 'red' : '#bbb')"
          fill="white"
          stroke-width="1"
        />
      </template>
      <template v-else-if="isExit">
        <circle
          :r="node.height / 2"
          :cx="node.width / 2"
          :cy="node.height / 2"
          :stroke="isSelected
            ? 'black'
            : (isExecuting ? 'red' : '#bbb')"
          fill="white"
          stroke-width="1"
        />
      </template>
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
  </g>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowNode } from '@/commons/types';
import { isNodeProcess } from '@/commons/utils';
import type { FlowchartNode } from '../VFlowchart/types';
import VNodeProcess from './VNodeProcess.vue';

export default {
  name: 'VNode',
  components: { VNodeProcess },
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
    /** Whether the node is selected in the interface. */
    isSelected: {
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
    isProcess(): boolean {
      return isNodeProcess(this.node);
    },
  },
};
</script>

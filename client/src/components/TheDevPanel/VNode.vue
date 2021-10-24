<template>
  <g @contextmenu.stop="$emit('contextmenu:node', node, $event)">
    <template v-if="isInitialization || isProcess">
      <template v-if="isInteractive">
        <!-- icon denoting the node is interactive -->
        <g :transform="`translate(${0},${-20})`">
          <rect
            width="20"
            height="20"
            fill="white"
            stroke="#bbb"
            stroke-width="1"
          />
          <text
            x="10"
            y="15"
            style="
              text-anchor: middle;
              user-select: none;
              font-family: Font Awesome\ 5 Free;
              font-weight: 900;
            "
          >
            &#xf007;
          </text>
        </g>
      </template>
      <template v-if="!isServerless">
        <!-- icon denoting the node is not serverless -->
        <g :transform="`translate(${isInteractive ? 20 : 0},${-20})`">
          <rect
            width="20"
            height="20"
            fill="white"
            stroke="#bbb"
            stroke-width="1"
          />
          <text
            x="10"
            y="15"
            style="
              text-anchor: middle;
              user-select: none;
              font-family: Font Awesome\ 5 Free;
              font-weight: 900;
            "
          >
            &#xf233;
          </text>
        </g>
      </template>
      <rect
        :width="node.width"
        :height="node.height"
        :stroke="isSelected
          ? 'black'
          : (isExecuting ? 'red' : '#bbb')"
        fill="white"
        stroke-width="1"
      />
      <rect
        :width="node.width"
        :fill="isProcess ? '#8C564B' : '#FF7F0E'"
        height="5"
      />
    </template>
    <template v-else-if="isDecision">
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
  </g>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import {
  isNodeProcess,
  isNodeInteractive,
  isNodeServerless,
} from '@/commons/utils';
import { FlowchartNode } from '../VFlowchart/types';

export default Vue.extend({
  name: 'VNode',
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
    isInteractive(): boolean {
      return isNodeInteractive(this.node);
    },
    isInitialization(): boolean {
      return this.node.type === WorkflowNodeType.Initialization;
    },
    isProcess(): boolean {
      return isNodeProcess(this.node);
    },
    isServerless(): boolean {
      return isNodeServerless(this.node);
    },
  },
});
</script>

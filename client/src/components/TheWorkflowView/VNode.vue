<template>
  <g>
    <!-- The tooltip. -->
    <title>{{ title }}</title>

    <!-- The background of the node. -->
    <rect
      :width="node.width"
      :height="node.height"
      fill="#F4F4F4"
    />

    <!-- The node header. -->
    <rect
      :width="node.width"
      :height="cellSize"
      :fill="nodeTypeToColor(node.type)"
    />

    <!-- The body of the node denoting node type with different shapes. -->
    <g :transform="`translate(0,${cellSize})`">
      <VNodeBody
        color="#bbb"
        :type="node.type"
        :width="node.width"
        :height="node.height - cellSize"
      />
    </g>

    <!-- The icons denoting module inputs. -->
    <VNodeArgIcons
      :args="inputs"
      :icon-size="cellSize"
    />

    <!-- The arrow pointing to outputs. -->
    <g
      v-if="inputs !== undefined && outputs !== undefined"
      color="white"
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 -5 10 10"
          refX="8"
          refY="0"
          markerWidth="5"
          markerHeight="10"
          orient="auto"
        >
          <path
            d="M0,-5L10,0L0,5"
            fill="currentColor"
          />
        </marker>
      </defs>
      <line
        :x1="(inputs.length * cellSize + node.width - outputs.length * cellSize) / 2 - cellSize / 2"
        :x2="(inputs.length * cellSize + node.width - outputs.length * cellSize) / 2 + cellSize / 2"
        :y1="cellSize / 2"
        :y2="cellSize / 2"
        stroke="currentColor"
        stroke-width="1"
        marker-end="url(#arrow)"
      />
    </g>

    <!-- The icon denoting module output. -->
    <g :transform="`translate(${node.width - cellSize * outputs.length},0)`">
      <VNodeArgIcons
        :args="outputs"
        :icon-size="cellSize"
      />
    </g>

    <!-- The icons denoting module properties. -->
    <g :transform="`translate(${node.width - cellSize},${node.height - cellSize})`">
      <VNodePropertyIcons
        :node="node"
        :icons-size="cellSize"
      />
    </g>

    <!-- The node label. -->
    <text
      :y="(node.height - cellSize) / 2 + cellSize"
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

    <!-- The border of the node. -->
    <rect
      :width="node.width"
      :height="node.height"
      fill="none"
      stroke="currentColor"
      stroke-width="1"
    />

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
import type { WorkflowNode } from '@/commons/types';
import { WorkflowNodeType } from '@/commons/types';
import { nodeTypeToColor } from '@/commons/utils';
import IconAnimatedSpinner from '@/plugins/icons/IconAnimatedSpinner.vue';
import type { FlowchartNode } from '../VFlowchart/types';
import VNodeArgIcons from './VNodeArgIcons.vue';
import VNodePropertyIcons from './VNodePropertyIcons.vue';
import VNodeBody from './VNodeBody.vue';

export default defineComponent({
  name: 'VNode',
  components: {
    VNodeArgIcons,
    VNodePropertyIcons,
    VNodeBody,
    IconAnimatedSpinner,
  },
  props: {
    node: {
      type: Object as PropType<WorkflowNode & FlowchartNode | null>,
      default: null,
    },
    /** Whether the node is currently executed. */
    isExecuting: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  data() {
    return { cellSize: 20 };
  },
  computed: {
    title(): string {
      const { node } = this;
      if (node === null) return '';
      return `node type: ${node.type}\n${
        node.value?.label !== undefined ? `implementation: ${node.value.label}` : ''
      }`;
    },
    isDecision(): boolean {
      return this.node?.type === WorkflowNodeType.Decision;
    },
    isExit(): boolean {
      return this.node?.type === WorkflowNodeType.Exit;
    },
    inputs(): string[] {
      return this.node?.value?.inputs ?? [];
    },
    outputs(): string[] {
      return this.node?.value?.outputs ?? [];
    },
  },
  methods: { nodeTypeToColor },
});
</script>

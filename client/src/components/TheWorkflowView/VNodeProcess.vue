<template>
  <g>
    <!-- The background of the node. -->
    <rect
      :width="node.width"
      :height="node.height"
      fill="white"
    />

    <!-- The node header. -->
    <rect
      :width="node.width"
      :height="cellSize"
      :fill="isProcess ? '#8C564B' : '#FF7F0E'"
    />

    <!-- The icons denoting module inputs. -->
    <g
      v-for="(input, i) in inputs"
      :key="`input-${i}`"
      :transform="`translate(${cellSize * i},0)`"
    >
      <!-- The square region where the tooltip can be triggered. -->
      <rect
        :width="cellSize"
        :height="cellSize"
        opacity="0"
      />
      <title>
        {{ input }}
      </title>
      <g transform="translate(2,2)">
        <component
          :is="getIcon(input)"
          color="white"
          width="16"
          height="16"
        />
      </g>
    </g>

    <!-- The arrow pointing to outputs. -->
    <g color="white">
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
        v-if="inputs !== undefined && outputs !== undefined"
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
    <g
      v-for="(output, i) in outputs"
      :key="`output-${i}`"
      :transform="`translate(${node.width - cellSize * (i + 1)},0)`"
    >
      <!-- The square region where the tooltip can be triggered. -->
      <rect
        :width="cellSize"
        :height="cellSize"
        opacity="0"
      />
      <title>
        {{ output }}
      </title>
      <g transform="translate(2,2)">
        <component
          :is="getIcon(output)"
          :width="cellSize - 4"
          :height="cellSize - 4"
          color="white"
        />
      </g>
    </g>

    <!-- The icons denoting module properties. -->
    <g
      v-for="(icon, i) in propertyIcons"
      :key="i"
      :transform="`translate(${node.width - cellSize},${node.height - cellSize * (i + 1)})`"
    >
      <rect
        :width="cellSize"
        :height="cellSize"
        fill="white"
        stroke="#bbb"
        stroke-width="1"
      />
      <component
        :is="icon"
        color="#bbb"
        :width="cellSize"
        :height="cellSize"
      />
    </g>

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

    <!-- The boundary of the node. -->
    <rect
      :width="node.width"
      :height="node.height"
      stroke="currentColor"
      fill="none"
      stroke-width="1"
    />
  </g>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { VueConstructor } from 'vue';
import type { WorkflowNode } from '@/commons/types';
import {
  isNodeProcess,
  isNodeInteractive,
  isNodeServerless,
} from '@/commons/utils';
import IconDataObjects from '@/plugins/icons/IconDataObjects.vue';
import IconFeatureRepresentations from '@/plugins/icons/IconFeatureRepresentations.vue';
import IconLabels from '@/plugins/icons/IconLabels.vue';
import IconLabelSpace from '@/plugins/icons/IconLabelSpace.vue';
import IconModel from '@/plugins/icons/IconModel.vue';
import IconSamples from '@/plugins/icons/IconSamples.vue';
import IconStop from '@/plugins/icons/IconStop.vue';
import IconServer from '@/plugins/icons/IconServer.vue';
import IconUser from '@/plugins/icons/IconUser.vue';
import type { FlowchartNode } from '../VFlowchart/types';

export default defineComponent({
  name: 'VNodeProcess',
  props: {
    node: {
      type: Object as PropType<WorkflowNode & FlowchartNode>,
      default: null,
    },
  },
  data() {
    return { cellSize: 20 };
  },
  computed: {
    isInteractive(): boolean {
      return isNodeInteractive(this.node);
    },
    isProcess(): boolean {
      return isNodeProcess(this.node);
    },
    isServerless(): boolean {
      return isNodeServerless(this.node);
    },
    inputs(): string[] {
      const { node } = this;
      return node === null ? [] : node.value?.inputs;
    },
    outputs(): string[] {
      const { node } = this;
      return node === null ? [] : node.value?.outputs;
    },
    propertyIcons(): VueConstructor[] {
      return [
        // whether the node is interactive
        ...(this.isInteractive ? [IconUser] : []),
        // whether the node is serverless
        ...(!this.isServerless ? [IconServer] : []),
      ];
    },
  },
  methods: {
    getIcon(input: string): VueConstructor | null {
      const map: Record<string, VueConstructor> = {
        dataObjects: IconDataObjects,
        labels: IconLabels,
        features: IconFeatureRepresentations,
        model: IconModel,
        queryUuids: IconSamples,
        categories: IconLabelSpace,
        stop: IconStop,
      };
      return input in map ? map[input] : null;
    },
  },
});
</script>

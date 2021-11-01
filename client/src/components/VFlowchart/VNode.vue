<template>
  <g
    :transform="`translate(${node.x},${node.y})`"
    cursor="move"
    @mouseover="$emit('hover:node', node)"
    @mousedown="$emit('mousedown:node', node, $event)"
    @mouseleave="$emit('leave:node', node)"
  >
    <!-- The geometric element of the node. -->
    <slot
      name="node-shape"
      :node="node"
      :is-selected="isSelected"
    >
      <rect
        :width="node.width"
        :height="node.height"
        :stroke="isSelected ? 'black' : '#bbb'"
        fill-opacity="0"
        stroke-width="1"
      />
    </slot>

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

    <!-- The ports for linking edges. -->
    <circle
      v-for="port in ports"
      :key="`${port.nodeId}-${port.direction}`"
      :cx="port.dx"
      :cy="port.dy"
      :opacity="isPortActive(port) ? 1 : 0"
      :stroke="hoveredPort !== null
        && hoveredPort.nodeId === port.nodeId
        && hoveredPort.direction === port.direction
        ? 'red'
        : '#bbb'"
      :stroke-width="isPortActive(port) ? 1 : 0"
      fill="white"
      r="4"
      style="cursor: crosshair"
      @mousedown.stop="$emit('drag:port', port)"
    />
  </g>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  PortDirection,
  FlowchartNode,
  FlowchartPort,
} from './types';

export default Vue.extend({
  name: 'VNode',
  props: {
    node: {
      type: Object as PropType<FlowchartNode>,
      required: true,
    },
    isHovered: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    isSelected: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    isDragged: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    hoveredPort: {
      type: Object as PropType<FlowchartPort>,
      default: null,
    },
  },
  computed: {
    ports(): FlowchartPort[] {
      const { node } = this;
      if (node.ports !== undefined) return node.ports;
      const { width, height } = node;
      return [{
        nodeId: node.id,
        direction: PortDirection.Top,
        dx: width / 2,
        dy: 0,
      }, {
        nodeId: node.id,
        direction: PortDirection.Left,
        dx: 0,
        dy: height / 2,
      }, {
        nodeId: node.id,
        direction: PortDirection.Bottom,
        dx: width / 2,
        dy: height,
      }, {
        nodeId: node.id,
        direction: PortDirection.Right,
        dx: width,
        dy: height / 2,
      }];
    },
  },
  methods: {
    isPortActive(port: FlowchartPort): boolean {
      const { hoveredPort } = this;
      // If the port is hovered, the port is active.
      if (hoveredPort !== null
        && hoveredPort.nodeId === port.nodeId
        && hoveredPort.direction === port.direction
      ) {
        return true;
      }
      // If the node of the port is hovered, the port is active.
      return this.isHovered;
    },
  },
});
</script>
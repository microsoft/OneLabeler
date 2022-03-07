<template>
  <g>
    <path
      v-for="(line, i) in guidelines"
      :key="i"
      :d="`M${line.x1},${line.y1}L${line.x2},${line.y2}`"
      stroke-width="1"
      stroke="currentColor"
      fill="none"
      stroke-dasharray="5,3"
    />
  </g>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { Line, FlowchartNode } from './types';

export default {
  name: 'VGuidelines',
  props: {
    /** The node for which guidelines are created. */
    node: {
      type: Object as PropType<FlowchartNode>,
      required: true,
    },
    /** The nodes whose bounding boxes are used to create guidelines. */
    nodes: {
      type: Array as PropType<FlowchartNode[]>,
      default: () => [] as FlowchartNode[],
    },
    /** Formatter of node position. */
    format: {
      type: Function as PropType<(d: number) => number>,
      required: true,
    },
  },
  computed: {
    guidelines(): Line[] {
      const { node, nodes } = this;
      const format = this.format as (d: number) => number;
      const xMinRound = format(node.x);
      const xMaxRound = format(node.x + node.width);
      const yMinRound = format(node.y);
      const yMaxRound = format(node.y + node.height);
      const guidelines: Line[] = [];
      nodes.forEach((d) => {
        if (d.id === node.id) return;
        [xMinRound, xMaxRound].forEach((xRound) => {
          if (d.x !== xRound) return;
          guidelines.push({
            x1: d.x,
            y1: d.height + Math.min(d.y, yMinRound),
            x2: d.x,
            y2: Math.max(d.y, yMinRound),
          });
        });
        [yMinRound, yMaxRound].forEach((yRound) => {
          if (d.y !== yRound) return;
          guidelines.push({
            x1: d.width + Math.min(d.x, xMinRound),
            y1: d.y,
            x2: Math.max(d.x, xMinRound),
            y2: d.y,
          });
        });
      });
      return guidelines;
    },
  },
};
</script>

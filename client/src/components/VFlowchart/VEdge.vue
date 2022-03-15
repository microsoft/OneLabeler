<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <g cursor="pointer">
    <slot
      :edge="edge"
      :path="path"
      :path-data="pathData"
      :is-selected="isSelected"
    >
      <defs>
        <marker
          :id="markerId"
          viewBox="0 -5 10 10"
          refX="10"
          refY="0"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path
            d="M0,-5L10,0L0,5"
            fill="currentcolor"
          />
        </marker>
      </defs>

      <!-- The visible edge. -->
      <path
        :d="pathData"
        stroke="currentcolor"
        stroke-width="1"
        fill="none"
        :marker-end="`url(#${markerId})`"
      />

      <!-- The invisible widened edge to make the edge easier to select. -->
      <path
        :d="pathData"
        stroke="transparent"
        stroke-width="10"
        fill="none"
      />
    </slot>
  </g>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { FlowchartPort, FlowchartNode } from './types';
import { getZaggedPathPoints } from './geometry';

type Point = [number, number];
type Path = Point[];

export default defineComponent({
  name: 'VEdge',
  props: {
    edge: {
      type: Object as PropType<{
        source?: FlowchartPort,
        target?: FlowchartPort,
      }>,
      required: true,
    },
    /**
     * The source point of the edge.
     * If not given, the source point will be inferred
     * from source node position and port position.
     */
    sourcePoint: {
      type: Object as PropType<{ x: number, y: number } | null>,
      default: null,
    },
    /**
     * The source node of the edge.
     * If source point is give, source node will not be used.
     */
    sourceNode: {
      type: Object as PropType<FlowchartNode | null>,
      default: null,
    },
    targetPoint: {
      type: Object as PropType<{ x: number, y: number } | null>,
      default: null,
    },
    targetNode: {
      type: Object as PropType<FlowchartNode | null>,
      default: null,
    },
    isSelected: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  data() {
    return {
      markerId: `arrow-${Math.round(Math.random() * 100000000)}`,
    };
  },
  computed: {
    x1(): number {
      const { source } = this.edge;
      const { sourcePoint, sourceNode } = this;
      if (sourcePoint !== null) return sourcePoint.x;
      if (sourceNode === null || source === undefined) {
        throw new Error('source point not specified');
      }
      return sourceNode.x + source.dx;
    },
    y1(): number {
      const { source } = this.edge;
      const { sourcePoint, sourceNode } = this;
      if (sourcePoint !== null) return sourcePoint.y;
      if (sourceNode === null || source === undefined) {
        throw new Error('source point not specified');
      }
      return sourceNode.y + source.dy;
    },
    x2(): number {
      const { target } = this.edge;
      const { targetPoint, targetNode } = this;
      if (targetPoint !== null) return targetPoint.x;
      if (targetNode === null || target === undefined) {
        throw new Error('target point not specified');
      }
      return targetNode.x + target.dx;
    },
    y2(): number {
      const { target } = this.edge;
      const { targetPoint, targetNode } = this;
      if (targetPoint !== null) return targetPoint.y;
      if (targetNode === null || target === undefined) {
        throw new Error('target point not specified');
      }
      return targetNode.y + target.dy;
    },
    path(): Path {
      const { source, target } = this.edge;
      const points = getZaggedPathPoints(
        {
          x1: this.x1,
          y1: this.y1,
          x2: this.x2,
          y2: this.y2,
        },
        source?.direction,
        target?.direction,
      );
      return points;
    },
    pathData(): string {
      return `M${this.path.map((d) => d.join(',')).join('L')}`;
    },
  },
});
</script>

<template>
  <g cursor="pointer">
    <!-- The arrow. -->
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
      :id="pathId"
      :d="pathData"
      stroke="currentcolor"
      stroke-width="1"
      fill="none"
      :marker-end="`url(#${markerId})`"
    />

    <!-- The text label of the edge. -->
    <g
      :transform="`translate(
      ${path[0][0] + (dx <= 0 ? -textBoxWidth : 0)},
      ${path[0][1] + (dy <= 0 ? -textBoxHeight : 0)})`"
    >
      <svg
        :width="textBoxWidth"
        :height="textBoxHeight"
      >
        <text
          fill="currentcolor"
          x="50%"
          y="50%"
          text-anchor="middle"
          dominant-baseline="central"
        >
          {{ label }}
        </text>
      </svg>
    </g>

    <!-- The invisible widened edge to make the edge easier to select. -->
    <path
      :d="pathData"
      stroke="transparent"
      stroke-width="10"
      fill="none"
    />
  </g>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';

type Point = [number, number];
type Path = Point[];

export default defineComponent({
  name: 'VEdge',
  props: {
    path: {
      type: Array as PropType<Path>,
      required: true,
    },
    pathData: {
      type: String as PropType<string>,
      required: true,
    },
    label: {
      type: String as PropType<string>,
      default: '',
    },
  },
  data() {
    return {
      markerId: `arrow-${Math.round(Math.random() * 100000000)}`,
      pathId: `path-${Math.round(Math.random() * 100000000)}`,
      textBoxWidth: 40,
      textBoxHeight: 20,
    };
  },
  computed: {
    firstPoint(): Point | null {
      return this.path.length >= 1 ? this.path[0] : null;
    },
    secondPoint(): Point | null {
      return this.path.length >= 2 ? this.path[1] : null;
    },
    dx(): number {
      if (this.firstPoint === null || this.secondPoint === null) return 0;
      return this.secondPoint[0] - this.firstPoint[0];
    },
    dy(): number {
      if (this.firstPoint === null || this.secondPoint === null) return 0;
      return this.secondPoint[1] - this.firstPoint[1];
    },
  },
});
</script>

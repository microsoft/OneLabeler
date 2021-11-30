<template>
  <g>
    <!-- The lasso created path. -->
    <path
      v-if="lassoPolygon.length !== 0"
      :d="polygonToPath(lassoPolygon)"
      fill="#bbb"
      fill-opacity="0.1"
      stroke="#bbb"
      stroke-width="2"
      stroke-dasharray="2, 2"
    />

    <!-- The closing line. -->
    <line
      v-if="withinClosingDistance"
      :x1="lastPoint[0]"
      :y1="lastPoint[1]"
      :x2="firstPoint[0]"
      :y2="firstPoint[1]"
      stroke="#000"
      stroke-width="2"
      stroke-dasharray="2, 2"
    />

    <!-- The interaction medium. -->
    <rect
      ref="medium"
      :width="width"
      :height="height"
      opacity="0"
    />
  </g>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import * as d3 from 'd3';

type Point = [number, number];

/**
 * Compile a polygon to a string specifying
 * the polygon boundary path for svg path element.
 */
const polygonToPath = (polygon: [number, number][]): string => (
  `M${polygon.map((d) => d.join(',')).join('L')}`
);

/** Compute the euclidean distance between two points.  */
const distance = (pt1: Point, pt2: Point): number => Math.sqrt(
  ((pt2[0] - pt1[0]) ** 2) + ((pt2[1] - pt1[1]) ** 2),
);

export default defineComponent({
  name: 'VLasso',
  props: {
    /** The width of the spared region. */
    width: {
      type: Number as PropType<number>,
      default: 400,
    },
    /** The height of the spared region. */
    height: {
      type: Number as PropType<number>,
      default: 400,
    },
    /**
     * The distance threshold.
     * If distance between the last point and
     * the first point is below the threshold,
     * the lasso path should withinClosingDistance when mouse is released.
     */
    closingDistance: {
      type: Number as PropType<number>,
      default: 75,
    },
  },
  emits: {
    'lasso:start': null,
    'lasso:move': null,
    'lasso:end': null,
  },
  data() {
    return {
      lassoPolygon: [] as Point[],
    };
  },
  computed: {
    firstPoint(): Point | null {
      if (this.lassoPolygon.length === 0) return null;
      return this.lassoPolygon[0];
    },
    lastPoint(): Point | null {
      if (this.lassoPolygon.length === 0) return null;
      return this.lassoPolygon[this.lassoPolygon.length - 1];
    },
    // Check if start and end points are within closing distance.
    withinClosingDistance(): boolean {
      const {
        firstPoint,
        lastPoint,
        closingDistance,
      } = this;
      if (firstPoint === null || lastPoint === null) return false;
      return distance(firstPoint, lastPoint) < closingDistance;
    },
  },
  mounted() {
    const medium = this.$refs.medium as SVGRectElement;
    const drag = d3
      .drag()
      .on('start', this.started)
      .on('drag', this.dragged)
      .on('end', this.ended);
    d3.select<Element, unknown>(medium).call(drag);
  },
  methods: {
    started(event: MouseEvent): void {
      // Store the start point.
      this.lassoPolygon = [[event.x, event.y]];
      this.$emit('lasso:start', this.lassoPolygon);
    },
    dragged(event: MouseEvent): void {
      const point = [event.x, event.y] as [number, number];
      this.lassoPolygon = [...this.lassoPolygon, point];
      this.$emit('lasso:move', this.lassoPolygon);
    },
    ended(): void {
      if (this.withinClosingDistance) {
        this.$emit('lasso:end', this.lassoPolygon);
      }
      this.lassoPolygon = [];
    },
    polygonToPath,
  },
});
</script>

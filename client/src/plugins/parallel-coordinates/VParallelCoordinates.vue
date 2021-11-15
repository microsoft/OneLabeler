<template>
  <g :transform="`translate(${margin.left},${margin.top})`">
    <!-- The lines. -->
    <g
      fill="none"
      stroke-width="1.5"
      stroke-opacity="0.4"
    >
      <path
        v-for="(d, i) in data"
        :key="i"
        :d="line(d)"
        stroke="steelblue"
      />
    </g>

    <!-- The axes of each dimension. -->
    <g
      v-for="(d, i) in dimensions"
      :key="i"
      :transform="`translate(${x(d)})`"
    >
      <VAxisLeft :scale="y[d]">
        <text
          y="-9"
          style="text-anchor: middle"
        >
          {{ d }}
        </text>
      </VAxisLeft>
    </g>
  </g>
</template>

<script lang="ts">
import { PropType } from 'vue';
import * as d3 from 'd3';
import VAxisLeft from '../axis/VAxisLeft.vue';

export type Datum = Record<string | number, number>;
export type Margin = { top: number, right: number, bottom: number, left: number };
export type Range = [number, number];
export type Point = [number, number];

export default {
  name: 'VParallelCoordinates',
  components: { VAxisLeft },
  props: {
    /** The data points to be rendered. */
    data: {
      type: Array as PropType<Datum[]>,
      required: true,
    },
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
    /** The margin between chart container and spared region. */
    margin: {
      type: Object as PropType<Margin>,
      default: () => ({
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      }),
    },
  },
  computed: {
    innerWidth(): number {
      return this.width - this.margin.left - this.margin.right;
    },
    innerHeight(): number {
      return this.height - this.margin.top - this.margin.bottom;
    },
    dimensions(): string[] {
      const { data } = this;
      if (data.length === 0) return [];
      return Object.keys(data[0]);
    },
    x(): d3.ScalePoint<string> {
      const { innerWidth, dimensions } = this;
      return d3.scalePoint()
        .range([0, innerWidth])
        .domain(dimensions);
    },
    y(): Record<string, d3.ScaleLinear<number, number, never>> {
      const {
        innerHeight,
        dimensions,
        data,
      } = this;
      return Object.fromEntries(dimensions.map((dim) => {
        const extent = d3.extent(data, (d) => d[dim]) as Range;
        const scale = d3.scaleLinear()
          .range([innerHeight, 0])
          .domain(extent);
        return [dim, scale];
      }));
    },
  },
  methods: {
    line(d: Datum): string | null {
      const { dimensions, x, y } = this;
      const points: Point[] = dimensions
        .map((key) => [x(key) as number, y[key](d[key])]);
      return d3.line()(points);
    },
  },
};
</script>

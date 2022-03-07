<template>
  <g :transform="`translate(${margin.left},${margin.top})`">
    <!-- The lines. -->
    <g
      fill="none"
      stroke-width="1.5"
      stroke-opacity="0.4"
    >
      <template v-for="(d, i) in data">
        <slot
          name="line"
          :d="line(d)"
          :i="i"
        >
          <path
            :key="i"
            :d="line(d)"
            :stroke="strokeMap(d, i)"
          />
        </slot>
      </template>
    </g>

    <!-- The axes of each dimension. -->
    <g
      v-for="(d, i) in dimensions"
      :key="i"
      :transform="`translate(${xScale(d)})`"
    >
      <VAxisLeft :scale="yScales[d]">
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
    /** The accessor of point stroke. */
    strokeMap: {
      type: Function as PropType<((d: Datum, i: number) => string) | null>,
      default: () => 'steelblue',
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
    xScale(): d3.ScalePoint<string> {
      return d3.scalePoint(this.dimensions, [0, this.innerWidth]);
    },
    yScales(): Record<string, d3.ScaleLinear<number, number, never>> {
      const {
        innerHeight,
        dimensions,
        data,
      } = this;
      return Object.fromEntries(dimensions.map((dim) => {
        const domain = d3.extent(data, (d) => d[dim]) as Range;
        const scale = d3.scaleLinear(domain, [innerHeight, 0]);
        return [dim, scale];
      }));
    },
  },
  methods: {
    line(d: Datum): string | null {
      const { dimensions, xScale, yScales } = this;
      const points: Point[] = dimensions
        .map((key) => [xScale(key) as number, yScales[key](d[key])]);
      return d3.line()(points);
    },
  },
};
</script>

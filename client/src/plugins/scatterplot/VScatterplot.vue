<template>
  <g :transform="`translate(${margin.left},${margin.top})`">
    <!-- scatter dots -->
    <circle
      v-for="(d, i) in data"
      :key="`${xMap(d, i)}-${yMap(d, i)}-i`"
      :r="rMap(d, i)"
      :cx="x(xMap(d, i))"
      :cy="y(yMap(d, i))"
      :fill="fillMap(d, i)"
      :stroke="strokeMap(d, i)"
      stroke-width="0.5"
    />

    <!-- x-axis -->
    <VAxisBottom
      v-if="xAxis !== null"
      :scale="x"
      :tick-arguments="xTickArguments"
      :transform="`translate(0,${innerHeight})`"
      style="font-size: 8px; font-family: sans-serif;"
    >
      <text
        :x="innerWidth"
        dy="2.5em"
        dx="0em"
        fill="currentColor"
      >
        {{ xAxis.label }}
      </text>
    </VAxisBottom>

    <!-- y-axis -->
    <VAxisLeft
      v-if="yAxis !== null"
      :scale="y"
      :tick-arguments="yTickArguments"
      style="font-size: 8px; font-family: sans-serif;"
    >
      <text
        transform="rotate(-90)"
        dy="-3em"
        fill="currentColor"
      >
        {{ yAxis.label }}
      </text>
    </VAxisLeft>
  </g>
</template>

<script lang="ts">
import { PropType } from 'vue';
import * as d3 from 'd3';
import VAxisBottom from '../axis/VAxisBottom.vue';
import VAxisLeft from '../axis/VAxisLeft.vue';

export type Datum = Record<string | number, unknown>;
export type Margin = { top: number, right: number, bottom: number, left: number };
export type Range = [number, number];
export type Axis = {
  label: string,
  tickNum: number | null,
  extent: Range | null,
};
export type NumberAccessor = <T>(
  datum: T,
  i: number,
  array: Iterable<T>,
) => number;

export default {
  name: 'VScatterplot',
  components: { VAxisBottom, VAxisLeft },
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
    /** The configuration of x axis. */
    xAxis: {
      type: Object as PropType<Axis | null>,
      default: () => ({
        label: 'x',
        tickNum: null,
        extent: null,
      }),
    },
    /** The configuration of y axis. */
    yAxis: {
      type: Object as PropType<Axis | null>,
      default: () => ({
        label: 'y',
        tickNum: null,
        extent: null,
      }),
    },
    /** The accessor of point x value. */
    xMap: {
      type: Function as PropType<NumberAccessor>,
      default: (d: Datum) => d.x,
    },
    /** The accessor of point y value. */
    yMap: {
      type: Function as PropType<NumberAccessor>,
      default: (d: Datum) => d.y,
    },
    /** The accessor of point radius. */
    rMap: {
      type: Function as PropType<((d: Datum, i: number) => number) | null>,
      default: () => 3,
    },
    /** The accessor of point color. */
    fillMap: {
      type: Function as PropType<((d: Datum, i: number) => string) | null>,
      default: () => '#888888',
    },
    /** The accessor of point stroke. */
    strokeMap: {
      type: Function as PropType<((d: Datum, i: number) => string) | null>,
      default: () => '#bbbbbb',
    },
  },
  computed: {
    innerWidth(): number {
      return this.width - this.margin.left - this.margin.right;
    },
    innerHeight(): number {
      return this.height - this.margin.top - this.margin.bottom;
    },
    x(): d3.ScaleLinear<number, number, never> {
      const { innerWidth } = this;
      const xMap = this.xMap as NumberAccessor;
      const xExtent = this.xAxis?.extent
        ?? d3.extent(this.data, xMap) as Range;
      return d3.scaleLinear()
        .range([0, innerWidth])
        .domain(xExtent);
    },
    xTickArguments(): [number] | [] {
      const tickNum = this.xAxis?.tickNum ?? null;
      if (tickNum !== null) return [tickNum];
      return [];
    },
    y(): d3.ScaleLinear<number, number, never> {
      const { innerHeight } = this;
      const yMap = this.yMap as NumberAccessor;
      const yExtent = this.yAxis?.extent
        ?? d3.extent(this.data, yMap) as Range;
      return d3.scaleLinear()
        .range([innerHeight, 0])
        .domain(yExtent);
    },
    yTickArguments(): [number] | [] {
      const tickNum = this.yAxis?.tickNum ?? null;
      if (tickNum !== null) return [tickNum];
      return [];
    },
  },
};
</script>

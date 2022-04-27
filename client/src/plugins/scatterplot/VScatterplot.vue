<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <g>
    <!-- scatter dots -->
    <circle
      v-for="i in indices"
      :key="i"
      :r="rMap(data[i], i)"
      :cx="xScale(xData[i])"
      :cy="yScale(yData[i])"
      :fill="fillMap(data[i], i)"
      :stroke="strokeMap(data[i], i)"
      stroke-width="0.5"
    />

    <!-- x-axis -->
    <VAxisBottom
      v-if="xAxis !== null"
      :scale="xScale"
      :tick-arguments="xTickArguments"
      :transform="`translate(0,${height - margin.bottom})`"
      style="font-size: 8px; font-family: sans-serif;"
    >
      <text
        :x="width - margin.right"
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
      :scale="yScale"
      :tick-arguments="yTickArguments"
      :transform="`translate(${margin.left},0)`"
      style="font-size: 8px; font-family: sans-serif;"
    >
      <text
        transform="rotate(-90)"
        :x="-margin.top"
        dy="-3em"
        fill="currentColor"
      >
        {{ yAxis.label }}
      </text>
    </VAxisLeft>
  </g>
</template>

<script lang="ts">
// reference: https://observablehq.com/@d3/scatterplot?collection=@d3/charts
import {
  computed,
  defineComponent,
  toRefs,
  PropType,
} from '@vue/composition-api';
import { range, scaleLinear } from 'd3';
import VAxisBottom from '../axis/VAxisBottom.vue';
import VAxisLeft from '../axis/VAxisLeft.vue';

export type Datum = Record<string | number, unknown>;
export type Margin = { top: number, right: number, bottom: number, left: number };
export type Range = [number, number];
export type Axis = {
  label: string,
  tickNum: number | null,
  domain: Range | null,
};
export type MapCallback<T, U> = (value: T, index: number, array: T[]) => U;

export default defineComponent({
  name: 'VScatterplot',
  components: { VAxisBottom, VAxisLeft },
  props: {
    /** The data points to be rendered. */
    data: {
      type: Array as PropType<Datum[]>,
      required: true,
    },
    /** The accessor of point x value. */
    xMap: {
      type: Function as PropType<MapCallback<Datum, number>>,
      default: (d: Datum) => d[0],
    },
    /** The accessor of point y value. */
    yMap: {
      type: Function as PropType<MapCallback<Datum, number>>,
      default: (d: Datum) => d[1],
    },
    /** The accessor of point radius. */
    rMap: {
      type: Function as PropType<((d: Datum, i: number) => number)>,
      default: () => 3,
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
        domain: null,
      }),
    },
    /** The configuration of y axis. */
    yAxis: {
      type: Object as PropType<Axis | null>,
      default: () => ({
        label: 'y',
        tickNum: null,
        domain: null,
      }),
    },
    /** The accessor of point color. */
    fillMap: {
      type: Function as PropType<((d: Datum, i: number) => string)>,
      default: () => '#888888',
    },
    /** The accessor of point stroke. */
    strokeMap: {
      type: Function as PropType<((d: Datum, i: number) => string)>,
      default: () => '#bbbbbb',
    },
  },
  setup(props) {
    const {
      width,
      height,
      margin,
      data,
      xMap,
      yMap,
      xAxis,
      yAxis,
    } = toRefs(props);

    const xData = computed(() => data.value.map(xMap.value));
    const xDomain = computed(() => xAxis.value?.domain
      ?? [Math.min(...xData.value), Math.max(...xData.value)] as Range);
    const xScale = computed(() => scaleLinear(
      xDomain.value,
      [margin.value.left, width.value - margin.value.right],
    ));
    const xTickArguments = computed(() => {
      const tickNum = xAxis.value?.tickNum ?? null;
      return tickNum !== null ? [tickNum] as [number] : [];
    });

    const yData = computed(() => data.value.map(yMap.value));
    const yDomain = computed(() => yAxis.value?.domain
      ?? [Math.min(...yData.value), Math.max(...yData.value)] as Range);
    const yScale = computed(() => scaleLinear(
      yDomain.value,
      [height.value - margin.value.bottom, margin.value.top],
    ));
    const yTickArguments = computed(() => {
      const tickNum = yAxis.value?.tickNum ?? null;
      return tickNum !== null ? [tickNum] as [number] : [];
    });

    const indices = computed(() => range(data.value.length));

    return {
      xData,
      yData,
      xScale,
      yScale,
      xTickArguments,
      yTickArguments,
      indices,
    };
  },
});
</script>

<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <g>
    <!-- heatmap bins -->
    <template v-for="(d, i) in binData">
      <slot
        name="cell"
        :width="Math.max(innerWidth / nColumns, 0)"
        :height="Math.max(innerHeight / nRows, 0)"
        :x="d.column * innerWidth / nColumns + margin.left"
        :y="(nRows - 1 - d.row) * innerHeight / nRows + margin.top"
        :fill="fill(d.indices.length)"
        :datum="d"
      >
        <rect
          :key="i"
          :width="Math.max(innerWidth / nColumns, 0)"
          :height="Math.max(innerHeight / nRows, 0)"
          :x="d.column * innerWidth / nColumns + margin.left"
          :y="(nRows - 1 - d.row) * innerHeight / nRows + margin.top"
          :fill="fill(d.indices.length)"
          stroke="white"
          stroke-width="1"
        />
      </slot>
    </template>

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
import {
  computed,
  defineComponent,
  toRefs,
  PropType,
} from '@vue/composition-api';
import { interpolateLab, scaleLinear } from 'd3';
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
export type BinDatum = { indices: number[], row: number, column: number };
export type BinData = BinDatum[];

const binning = (
  xData: number[],
  yData: number[],
  nRows: number,
  nColumns: number,
  xDomain: Range,
  yDomain: Range,
): BinData => {
  const [xMin, xMax] = xDomain;
  const [yMin, yMax] = yDomain;

  // initialize 3d array of size (nRows, nColumns, 0)
  const binMatrix: number[][][] = new Array(nRows).fill(null).map(() => (
    new Array(nColumns).fill(null).map(
      () => new Array(0) as number[],
    )
  ));

  xData.forEach((x: number, i: number) => {
    const y = yData[i];
    let row = Math.floor((nRows * (y - yMin)) / (yMax - yMin));
    if (row === nRows) row = nRows - 1;
    let column = Math.floor((nColumns * (x - xMin)) / (xMax - xMin));
    if (column === nColumns) column = nColumns - 1;
    binMatrix[row][column].push(i);
  });
  const binData: BinData = [];
  binMatrix.forEach((dataRow: number[][], i: number) => {
    dataRow.forEach((dataCell: number[], j: number) => {
      binData.push({
        row: i,
        column: j,
        indices: dataCell,
      });
    });
  });
  return binData;
};

export default defineComponent({
  name: 'VHeatmap',
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
    /** The number of rows in the heatmap. */
    nRows: {
      type: Number as PropType<number>,
      default: 10,
    },
    /** The number of columns in the heatmap. */
    nColumns: {
      type: Number as PropType<number>,
      default: 10,
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
      nRows,
      nColumns,
    } = toRefs(props);

    const xData = computed(() => data.value.map(xMap.value));
    const xDomain = computed(() => xAxis.value?.domain
      ?? [Math.min(...xData.value), Math.max(...xData.value)] as Range);
    const xScale = computed(() => scaleLinear(xDomain.value,
      [margin.value.left, width.value - margin.value.right]));
    const xTickArguments = computed(() => {
      const tickNum = xAxis.value?.tickNum ?? null;
      return tickNum !== null ? [tickNum] as [number] : [];
    });

    const yData = computed(() => data.value.map(yMap.value));
    const yDomain = computed(() => yAxis.value?.domain
      ?? [Math.min(...yData.value), Math.max(...yData.value)] as Range);
    const yScale = computed(() => scaleLinear(yDomain.value,
      [height.value - margin.value.bottom, margin.value.top]));
    const yTickArguments = computed(() => {
      const tickNum = yAxis.value?.tickNum ?? null;
      return tickNum !== null ? [tickNum] as [number] : [];
    });

    const binData = computed(() => binning(
      xData.value,
      yData.value,
      nRows.value,
      nColumns.value,
      xDomain.value,
      yDomain.value,
    ));

    const fill = computed(() => {
      const maxDots = Math.max(...binData.value.map((d) => d.indices.length));
      return scaleLinear([0, maxDots], ['#ffffff', '#67000d'])
        .interpolate(interpolateLab);
    });

    return {
      binData,
      xScale,
      yScale,
      xTickArguments,
      yTickArguments,
      fill,
    };
  },
  computed: {
    innerWidth(): number {
      return this.width - this.margin.left - this.margin.right;
    },
    innerHeight(): number {
      return this.height - this.margin.top - this.margin.bottom;
    },
  },
});
</script>

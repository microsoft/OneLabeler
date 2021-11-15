<template>
  <g :transform="`translate(${margin.left},${margin.top})`">
    <!-- heatmap bins -->
    <template v-for="d in binData">
      <slot
        name="cell"
        :width="Math.max(innerWidth / nColumns, 0)"
        :height="Math.max(innerHeight / nRows, 0)"
        :x="d.column * innerWidth / nColumns"
        :y="(nRows - 1 - d.row) * innerHeight / nRows"
        :fill="color(d.indices.length)"
        :datum="d"
      >
        <rect
          :key="`${d.row}-${d.column}`"
          :width="Math.max(innerWidth / nColumns, 0)"
          :height="Math.max(innerHeight / nRows, 0)"
          :x="d.column * innerWidth / nColumns"
          :y="(nRows - 1 - d.row) * innerHeight / nRows"
          :fill="color(d.indices.length)"
          stroke="white"
          stroke-width="1"
        />
      </slot>
    </template>

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
export type Data = Datum[];
export type Margin = { top: number, right: number, bottom: number, left: number };
export type Range = [number, number];
export type Axis = {
  label: string,
  tickNum: number | null,
  extent: Range | null,
};
export type NumberAccessor = <T>(
  datum?: T,
  i?: number,
  array?: Iterable<T>,
) => number;
export type BinDatum = { indices: number[], row: number, column: number };
export type BinData = BinDatum[];

const binning = (
  data: Data,
  xAccessor: NumberAccessor,
  yAccessor: NumberAccessor,
  nRows: number,
  nColumns: number,
  xExtent: [number, number],
  yExtent: [number, number],
): BinData => {
  const [xMin, xMax] = xExtent;
  const [yMin, yMax] = yExtent;

  // initialize 3d array of size (nRows, nColumns, 0)
  const binMatrix: number[][][] = new Array(nRows).fill(null).map(() => (
    new Array(nColumns).fill(null).map(
      () => new Array(0),
    )
  ));

  data.forEach((datum: Datum, i: number) => {
    const x = xAccessor(datum, i);
    const y = yAccessor(datum, i);
    let row = Math.floor((nRows * (y - yMin)) / (yMax - yMin));
    if (row === nRows) {
      row = nRows - 1;
    }
    let column = Math.floor((nColumns * (x - xMin)) / (xMax - xMin));
    if (column === nColumns) {
      column = nColumns - 1;
    }
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

export default {
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
  },
  computed: {
    binData(): BinData {
      return binning(
        this.data,
        this.xMap as NumberAccessor,
        this.yMap as NumberAccessor,
        this.nRows,
        this.nColumns,
        this.xExtent,
        this.yExtent,
      );
    },
    innerWidth(): number {
      return this.width - this.margin.left - this.margin.right;
    },
    innerHeight(): number {
      return this.height - this.margin.top - this.margin.bottom;
    },
    xExtent(): Range {
      const xMap = this.xMap as NumberAccessor;
      return this.xAxis?.extent
        ?? d3.extent(this.data, xMap) as Range;
    },
    x(): d3.ScaleLinear<number, number, never> {
      const { innerWidth, xExtent } = this;
      return d3.scaleLinear()
        .range([0, innerWidth])
        .domain(xExtent);
    },
    xTickArguments(): [number] | [] {
      const tickNum = this.xAxis?.tickNum ?? null;
      if (tickNum !== null) return [tickNum];
      return [];
    },
    yExtent(): Range {
      const yMap = this.yMap as NumberAccessor;
      return this.yAxis?.extent
        ?? d3.extent(this.data, yMap) as Range;
    },
    y(): d3.ScaleLinear<number, number, never> {
      const { innerHeight, yExtent } = this;
      return d3.scaleLinear()
        .range([innerHeight, 0])
        .domain(yExtent);
    },
    yTickArguments(): [number] | [] {
      const tickNum = this.yAxis?.tickNum ?? null;
      if (tickNum !== null) return [tickNum];
      return [];
    },
    color(): d3.ScaleLinear<string, string, never> {
      const maxDots = Math.max(...this.binData.map((d) => d.indices.length));
      return d3.scaleLinear<string>()
        .domain([0, maxDots])
        .range(['#ffffff', '#67000d'])
        .interpolate(d3.interpolateLab);
    },
  },
};
</script>

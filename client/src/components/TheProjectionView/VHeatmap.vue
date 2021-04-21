<template>
  <svg
    ref="svg"
    style="height: 100%; width: 100%;"
  />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import * as d3 from 'd3';
import Lasso, { LassoEventType } from '@/plugins/d3.lasso';
import Heatmap from '@/plugins/d3.heatmap';
import { Label, Status } from '@/commons/types';

type Datum = { x: number, y: number, uuid: string };
type DatumBinned = { points: Datum[], row: number, column: number };
type Axis = { label: string, tickNum: number | null };

export default Vue.extend({
  name: 'VScatterplot',
  props: {
    points: {
      type: Array as PropType<[number, number][] | null>,
      required: false,
      default: null,
    },
    nRows: {
      type: Number as PropType<number>,
      required: true,
    },
    nColumns: {
      type: Number as PropType<number>,
      required: true,
    },
    uuids: {
      type: Array as PropType<string[]>,
      required: true,
    },
    labels: {
      type: Array as PropType<Label[]>,
      required: true,
    },
    statuses: {
      type: Array as PropType<Status[]>,
      required: true,
    },
    queryIndices: {
      type: Array as PropType<number[]>,
      required: true,
    },
    xAxis: {
      type: Object as PropType<Axis | null>,
      required: false,
      default: null,
    },
    yAxis: {
      type: Object as PropType<Axis | null>,
      required: false,
      default: null,
    },
    xExtent: {
      type: Array as unknown as PropType<[number, number] | null>,
      required: false,
      default: null,
    },
    yExtent: {
      type: Array as unknown as PropType<[number, number] | null>,
      required: false,
      default: null,
    },
  },
  data(): {
    chart: Heatmap | null,
    lassoInstance: Lasso | null,
    dotRadius: number,
    } {
    return {
      chart: null,
      lassoInstance: null,
      dotRadius: 3,
    };
  },
  watch: {
    points() {
      this.rerender();
    },
    labels() {
      this.rerender();
    },
    nRows() {
      this.rerender();
    },
    nColumns() {
      this.rerender();
    },
    queryIndices(queryIndices: number[]) {
      // TODO: check if this function significantly slow down the frontend.
      this.highlightHeatmap(queryIndices);
    },
  },
  mounted() {
    this.rerender();
  },
  methods: {
    emptyDisplay(): void {
      (this.$refs.svg as HTMLElement).innerHTML = '';
      this.lassoInstance = null;
    },
    getSelectedUuids(lassoPolygon: [number, number][]): string[] {
      const { svg } = this.$refs as { svg: SVGSVGElement};
      const margin = (this.chart as Heatmap).margin();
      let selectedUuids: string[] = [];
      d3.select(svg)
        .selectAll<SVGCircleElement, DatumBinned>('rect.grid')
        .each(function _(d: DatumBinned) {
          const width = +(this.getAttribute('width') as string);
          const height = +(this.getAttribute('height') as string);
          const x = +(this.getAttribute('x') as string);
          const y = +(this.getAttribute('y') as string);
          if (d3.polygonContains(
            lassoPolygon,
            [x + (width / 2) + margin.left, y + (height / 2) + margin.top],
          )) {
            selectedUuids = selectedUuids.concat(d.points.map((pt) => pt.uuid));
          }
        });
      return selectedUuids;
    },
    async rerender(): Promise<void> {
      if (this.points === null) {
        this.emptyDisplay();
        return;
      }
      const {
        points,
        uuids,
        queryIndices,
        xAxis,
        yAxis,
        xExtent,
        yExtent,
      } = this;
      const { svg } = this.$refs as { svg: SVGSVGElement};
      if (svg === undefined) return;
      await this.renderHeatmap(
        points,
        uuids,
        svg,
        xAxis,
        yAxis,
        xExtent,
        yExtent,
      );

      this.lassoInstance = new Lasso()
        .on(LassoEventType.End, (lassoPolygon: [number, number][]) => {
          (this.lassoInstance as Lasso).removePath();
          const selectedUuids = this.getSelectedUuids(lassoPolygon);
          this.$emit('select:uuids', selectedUuids);
        });
      this.lassoInstance.render(svg);
      this.highlightHeatmap(queryIndices);
    },
    highlightHeatmap(queryIndices: number[]): void {
      const { svg } = this.$refs as { svg: SVGSVGElement};
      const { uuids } = this;
      const queryUuids: Set<string> = new Set(queryIndices.map((d) => uuids[d]));
      d3.select(svg)
        .selectAll<SVGRectElement, DatumBinned>('rect.grid')
        .each(function _(d: DatumBinned) {
          const binUuids = d.points.map((pt) => pt.uuid);
          let highlight = true;
          if (queryUuids.size !== 0) {
            const union = new Set([...binUuids].filter((uuid) => queryUuids.has(uuid)));
            highlight = union.size > 0;
          }
          this.setAttribute('opacity', String(highlight ? 1 : 0.4));
        });
    },
    async renderHeatmap(
      points: [number, number][],
      uuids: string[],
      svg: SVGSVGElement,
      xAxis: Axis | null,
      yAxis: Axis | null,
      xExtent: [number, number] | null,
      yExtent: [number, number] | null,
    ): Promise<void> {
      const data: Datum[] = uuids.map((d, i) => ({
        uuid: d,
        x: points[i][0],
        y: points[i][1],
      }));

      // Note: clientWidth, clientHeight is the rounded value of the real size
      // thus, need to minus 1 to make sure the size doesn't overflow
      const width = svg.clientWidth - 1;
      const height = svg.clientHeight - 1;
      const chart = new Heatmap()
        .margin({
          top: 20, right: 10, left: 30, bottom: 30,
        })
        .width(width)
        .height(height)
        .duration(0)
        .xExtent(xExtent)
        .yExtent(yExtent)
        .nRows(this.nRows)
        .nColumns(this.nColumns)
        .xAxis(xAxis)
        .yAxis(yAxis)
        .xAccessor((d: unknown) => ((d as Datum).x))
        .yAccessor((d: unknown) => ((d as Datum).y));
      await chart.render(svg, data as Datum[]);
      this.chart = chart;
    },
  },
});
</script>

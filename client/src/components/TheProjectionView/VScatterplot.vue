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
import Scatterplot from '@/plugins/d3.scatterplot';
import { Label, Status } from '@/commons/types';

type Datum = { x: number, y: number, uuid: string };
type Axis = { label: string, tickNum: number | null };

export default Vue.extend({
  name: 'VScatterplot',
  props: {
    points: {
      type: Array as PropType<[number, number][] | null>,
      required: false,
      default: null,
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
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  data(): {
    chart: Scatterplot | null,
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
    label2color() {
      this.rerender();
    },
    queryIndices(queryIndices: number[]) {
      // TODO: check if this function significantly slow down the frontend.
      this.highlightScatterplot(queryIndices);
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
      const margin = (this.chart as Scatterplot).margin();

      const selectedUuids: string[] = [];
      d3.select(svg)
        .selectAll<SVGCircleElement, Datum>('circle')
        .each(function _(d: Datum) {
          const x = +(this.getAttribute('cx') as string);
          const y = +(this.getAttribute('cy') as string);
          const { uuid } = d;
          if (d3.polygonContains(
            lassoPolygon,
            [x + margin.left, y + margin.top],
          )) {
            selectedUuids.push(uuid);
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
        labels,
        queryIndices,
        xAxis,
        yAxis,
        xExtent,
        yExtent,
        label2color,
      } = this;
      const { svg } = this.$refs as { svg: SVGSVGElement};
      if (svg === undefined) return;
      await this.renderScatterplot(
        points,
        uuids,
        labels,
        svg,
        xAxis,
        yAxis,
        xExtent,
        yExtent,
        label2color,
      );

      this.lassoInstance = new Lasso()
        .on(LassoEventType.end, (lassoPolygon: [number, number][]) => {
          (this.lassoInstance as Lasso).removePath();
          const selectedUuids = this.getSelectedUuids(lassoPolygon);
          this.$emit('select-uuids', selectedUuids);
        });
      this.lassoInstance.render(svg);

      this.highlightScatterplot(queryIndices);
    },
    highlightScatterplot(queryIndices: number[]): void {
      const { svg } = this.$refs as { svg: SVGSVGElement};
      const { uuids, dotRadius } = this;
      const queryUuids: Set<string> = new Set(queryIndices.map((d) => uuids[d]));
      d3.select(svg)
        .selectAll<SVGCircleElement, Datum>('circle')
        .each(function _(d: Datum) {
          const { uuid } = d;
          const highlight = (queryUuids.size === 0) || queryUuids.has(uuid);
          this.setAttribute('r', String(highlight ? dotRadius : dotRadius / 2));
        });
    },
    async renderScatterplot(
      points: [number, number][],
      uuids: string[],
      labels: Label[],
      svg: SVGSVGElement,
      xAxis: Axis | null,
      yAxis: Axis | null,
      xExtent: [number, number] | null,
      yExtent: [number, number] | null,
      label2color: ((label: string) => string),
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
      const chart = new Scatterplot()
        .margin({
          top: 20, right: 10, left: 30, bottom: 30,
        })
        .width(width)
        .height(height)
        .duration(0)
        .xExtent(xExtent)
        .yExtent(yExtent)
        .xAxis(xAxis)
        .yAxis(yAxis)
        .xAccessor((d: unknown) => ((d as Datum).x))
        .yAccessor((d: unknown) => ((d as Datum).y))
        .fillAccessor((d: unknown, i: number) => label2color(labels[i] as string))
        .rAccessor(() => this.dotRadius);
      await chart.render(svg, data as Datum[]);
      this.chart = chart;
    },
  },
});
</script>

<template>
  <svg
    ref="svg"
    style="height: 100%; width: 100%;"
  />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import * as d3 from 'd3';
import Lasso, { ILasso, LassoEventType } from '@/plugins/d3.lasso';
import Scatterplot, { IScatterplot } from '@/plugins/d3.scatterplot';
import * as projectionAPI from '@/services/projection-api';
import { Label, Status } from '@/commons/types';

type Datum = { x: number, y: number, uuid: string };

export enum ProjectionMethod {
  PCA = 'PCA',
  MDS = 'MDS',
  TSNE = 't-SNE',
}

export default Vue.extend({
  name: 'VProjection',
  props: {
    featureValues: {
      type: Array as PropType<number[][]>,
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
    classes: {
      type: Array as PropType<Label[]>,
      required: true,
    },
    unlabeledMark: {
      type: [String, Number, Boolean] as PropType<Label>,
      required: true,
    },
    queryIndices: {
      type: Array as PropType<number[]>,
      required: true,
    },
    projectionMethod: {
      type: String as PropType<ProjectionMethod>,
      required: true,
    },
  },
  data(): {
    chart: IScatterplot | null,
    lassoInstance: ILasso | null,
    projection: number[][] | null,
    dotRadius: number,
    } {
    return {
      chart: null,
      lassoInstance: null,
      projection: null,
      dotRadius: 3,
    };
  },
  computed: {
    isFeatureValuesValid(): boolean {
      const { featureValues } = this;
      if (
        featureValues.length === 0
        || featureValues[0] === undefined
        || featureValues[0].length === 0
      ) {
        return false;
      }
      return true;
    },
  },
  watch: {
    async projectionMethod() {
      this.projection = await this.computeProjection();
      this.rerender();
    },
    async featureValues() {
      this.projection = await this.computeProjection();
      this.rerender();
    },
    labels() {
      this.rerender();
    },
    classes() {
      this.rerender();
    },
    unlabeledMark() {
      this.rerender();
    },
    queryIndices(queryIndices: number[]) {
      // TODO: check if this function significantly slow down the frontend.
      const { svg } = this.$refs as { svg: SVGSVGElement};
      const { uuids, dotRadius } = this;
      const queryUuids: Set<string> = new Set(queryIndices.map((d) => uuids[d]));
      d3.select(svg)
        .selectAll<SVGCircleElement, Datum>('circle')
        .each(function _(d: Datum) {
          const { uuid } = d;
          const highlight = queryUuids.has(uuid);
          this.setAttribute('r', String(highlight ? dotRadius * 2 : dotRadius));
        });
    },
  },
  mounted() {
    this.rerender();
  },
  methods: {
    async computeProjection(): Promise<number[][] | null> {
      if (!this.isFeatureValuesValid) return null;
      const { featureValues, projectionMethod } = this;
      if (projectionMethod === ProjectionMethod.PCA) {
        return projectionAPI.PCA(featureValues, 2);
      }
      if (projectionMethod === ProjectionMethod.MDS) {
        return projectionAPI.MDS(featureValues, 2);
      }
      if (projectionMethod === ProjectionMethod.TSNE) {
        return projectionAPI.TSNE(featureValues, 2);
      }
      return null;
    },
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
    rerender(): void {
      if (this.projection === null) {
        this.emptyDisplay();
        return;
      }
      const {
        projection,
        uuids,
        labels,
        classes,
        unlabeledMark,
      } = this;
      const { svg } = this.$refs as { svg: SVGSVGElement};
      if (svg === undefined) return;
      this.renderScatterplot(
        projection,
        uuids,
        labels,
        classes,
        unlabeledMark,
        svg,
      );

      this.lassoInstance = new Lasso()
        .on(LassoEventType.end, (lassoPolygon: [number, number][]) => {
          (this.lassoInstance as Lasso).removePath();
          const selectedUuids = this.getSelectedUuids(lassoPolygon);
          this.$emit('select-uuids', selectedUuids);
        });
      this.lassoInstance.render(svg);
    },
    renderScatterplot(
      projection: number[][],
      uuids: string[],
      labels: Label[],
      classes: Label[],
      unlabeledMark: Label,
      svg: SVGSVGElement,
    ): void {
      const labelstr2fill = d3.scaleOrdinal(['#bbbbbb', ...d3.schemeCategory10])
        .domain([unlabeledMark, ...classes].map((d) => String(d)));
      const data: Datum[] = uuids.map((d, i) => ({
        uuid: d,
        x: projection[i][0],
        y: projection[i][1],
      }));

      // Note: clientWidth, clientHeight is the rounded value of the real size
      // thus, need to minus 1 to make sure the size doesn't overflow
      const width = svg.clientWidth - 1;
      const height = svg.clientHeight - 1;
      const chart = new Scatterplot()
        .width(width)
        .height(height)
        .duration(0)
        .xAxis(null)
        .yAxis(null)
        .xAccessor((d: unknown) => ((d as Datum).x))
        .yAccessor((d: unknown) => ((d as Datum).y))
        .fillAccessor((d: unknown, i: number) => labelstr2fill(String(labels[i])))
        .rAccessor(() => this.dotRadius);
      chart.render(svg, data as Datum[]);
      this.chart = chart;
    },
  },
});
</script>

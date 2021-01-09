<template>
  <v-container
    ref="container"
    class="pa-0"
    fluid
  >
    <svg
      ref="svg"
      style="height: 100%; width: 100%;"
    />
  </v-container>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
// import * as numeric from 'numeric';
import * as d3 from 'd3';
import * as projectionAPI from '@/services/projection-api';
import { Label, Status } from '@/commons/types';
import Scatterplot, { IScatterplot } from '@/plugins/d3.scatterplot';

/*
const svd = (X: number[][], nComponents: number): number[][] => {
  const svdOutput = numeric.svd(X);
  const { U } = svdOutput;
  const { V } = svdOutput;
  const VTruncated = V.map((ele) => ele.slice(0, nComponents));
  return numeric.dot(U, VTruncated) as number[][];
};
*/

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
    projection: number[][] | null,
    } {
    return {
      chart: null,
      projection: null,
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
    rerender(): void {
      if (this.projection === null) {
        // clear svg
        (this.$refs.svg as HTMLElement).innerHTML = '';
        return;
      }
      const {
        projection,
        labels,
        classes,
        unlabeledMark,
      } = this;
      const { svg } = this.$refs;
      if (svg === undefined) return;
      this.renderScatterplot(
        projection,
        labels,
        classes,
        unlabeledMark,
        svg as SVGSVGElement,
      );
    },
    renderScatterplot(
      projection: number[][],
      labels: Label[],
      classes: Label[],
      unlabeledMark: Label,
      svg: SVGSVGElement,
    ): void {
      const labelstr2fill = d3.scaleOrdinal(['#bbbbbb', ...d3.schemeCategory10])
        .domain([unlabeledMark, ...classes].map((d) => String(d)));

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
        .xAccessor((d: unknown) => (d as number[])[0])
        .yAccessor((d: unknown) => (d as number[])[1])
        .fillAccessor((d: unknown, i: number) => labelstr2fill(String(labels[i])));
      chart.render(svg, projection as Record<number, number>[]);
      this.chart = chart;
    },
  },
});
</script>

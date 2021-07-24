<template>
  <div style="border: 0.5px solid #757575">
    <!-- The configure projection attribute dialog button. -->
    <VConfigurableProjectionHeader
      :feature-names="featureNames"
      :selected-feature-indices="selectedFeatureIndices"
      :projection-method="projectionMethod"
      :enable-binning="enableBinning"
      :binning-n-rows="binningNRows"
      :binning-n-columns="binningNColumns"
      :enable-subsampling="enableSubsampling"
      :subsampling-n-samples="subsamplingNSamples"
      @update:feature-indices="$emit('update:feature-indices', $event)"
      @click:projection-method="$emit('click:projection-method', $event)"
      @update:binning="$emit('update:binning', $event)"
      @update:subsampling="$emit('update:subsampling', $event)"
    />

    <!-- The dataset overview display. -->
    <VScatterplot
      v-if="!enableBinning"
      :points="pointsSampled"
      :uuids="uuidsSampled"
      :labels="labelsSampled"
      :query-uuids="queryUuids"
      :x-axis="xAxis"
      :y-axis="yAxis"
      :x-extent="xExtent"
      :y-extent="yExtent"
      :label2color="label2color"
      @select:uuids="$emit('select:uuids', $event)"
    />
    <VHeatmap
      v-else
      :points="pointsSampled"
      :uuids="uuidsSampled"
      :labels="labelsSampled"
      :query-uuids="queryUuids"
      :x-axis="xAxis"
      :y-axis="yAxis"
      :x-extent="xExtent"
      :y-extent="yExtent"
      :n-rows="binningNRows"
      :n-columns="binningNColumns"
      @select:uuids="$emit('select:uuids', $event)"
    />
  </div>
</template>

<script lang="ts">
import { xor4096 } from 'seedrandom';
import Vue, { PropType } from 'vue';
import * as projectionAPI from '@/services/projection-api';
import { ILabelCategory, ProjectionMethodType } from '@/commons/types';
import { randomShuffle } from '@/plugins/random';
import VScatterplot from './VScatterplot.vue';
import VHeatmap from './VHeatmap.vue';
import VConfigurableProjectionHeader from './VConfigurableProjectionHeader.vue';

export default Vue.extend({
  name: 'VConfigurableProjection',
  components: {
    VScatterplot,
    VHeatmap,
    VConfigurableProjectionHeader,
  },
  props: {
    selectedFeatureIndices: {
      type: Array as PropType<number[]>,
      required: true,
    },
    projectionMethod: {
      type: String as PropType<ProjectionMethodType>,
      required: true,
    },
    enableBinning: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    binningNRows: {
      type: Number as PropType<number>,
      required: true,
    },
    binningNColumns: {
      type: Number as PropType<number>,
      required: true,
    },
    enableSubsampling: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    subsamplingNSamples: {
      type: Number as PropType<number>,
      required: true,
    },
    featureValues: {
      type: Array as PropType<number[][]>,
      required: true,
    },
    uuids: {
      type: Array as PropType<string[]>,
      required: true,
    },
    labels: {
      type: Array as PropType<ILabelCategory[] | null>,
      default: null,
    },
    queryUuids: {
      type: Array as PropType<string[]>,
      required: true,
    },
    featureNames: {
      type: Array as PropType<string[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  data() {
    return {
      points: null as number[][] | null,
    };
  },
  computed: {
    xAxis(): { label: string, tickNum: number } | null {
      const { selectedFeatureIndices, featureNames } = this;
      if (selectedFeatureIndices.length === 2) {
        return {
          label: featureNames[selectedFeatureIndices[0]],
          tickNum: 5,
        };
      }
      return null;
    },
    yAxis(): { label: string, tickNum: number } | null {
      const { selectedFeatureIndices, featureNames } = this;
      if (selectedFeatureIndices.length === 2) {
        return {
          label: featureNames[selectedFeatureIndices[1]],
          tickNum: 5,
        };
      }
      return null;
    },
    xExtent(): [number, number] | null {
      const { points } = this;
      if (points === null || points.length === 0) {
        return null;
      }
      const xs = points.map((d) => d[0]);
      const xMin = Math.min(...xs);
      const xMax = Math.max(...xs);
      if (xMin === xMax) {
        return [xMin - 0.5, xMax + 0.5];
      }
      return [xMin, xMax];
    },
    yExtent(): [number, number] | null {
      const { points } = this;
      if (points === null || points.length === 0) {
        return null;
      }
      const ys = points.map((d) => d[1]);
      const yMin = Math.min(...ys);
      const yMax = Math.max(...ys);
      if (yMin === yMax) {
        return [yMin - 0.5, yMax + 0.5];
      }
      return [yMin, yMax];
    },
    selectedFeatureValues(): number[][] {
      const { featureValues, selectedFeatureIndices } = this;
      return featureValues.map((d: number[]) => (
        selectedFeatureIndices.map((i: number) => d[i])
      ));
    },
    subsampleIndices(): number[] | null {
      const { points, enableSubsampling, subsamplingNSamples } = this;
      if (points === null
        || enableSubsampling === false
        || points.length <= subsamplingNSamples) {
        return null;
      }
      const selection = [...Array(points.length).keys()];
      // The seed guarantees that given the same points,
      // the sample results are the same.
      const seed = `${points.length}-${JSON.stringify(points[0])}`;
      const shuffled = randomShuffle(selection, xor4096(seed));
      const indices = shuffled.slice(0, subsamplingNSamples);
      return indices;
    },
    pointsSampled(): number[][] | null {
      const { points, subsampleIndices } = this;
      if (points === null) return null;
      if (subsampleIndices === null) return points;
      return subsampleIndices.map((d: number) => (points as number[][])[d]);
    },
    uuidsSampled(): string[] {
      const { uuids, subsampleIndices } = this;
      if (subsampleIndices === null) return uuids;
      return subsampleIndices.map((d: number) => uuids[d]);
    },
    labelsSampled(): ILabelCategory[] | null {
      const { labels, subsampleIndices } = this;
      if (labels === null) return null;
      if (subsampleIndices === null) return labels;
      return subsampleIndices.map((d: number) => labels[d]);
    },
  },
  watch: {
    async selectedFeatureIndices() {
      if (this.selectedFeatureIndices.length <= 1) {
        this.points = null;
      }
      if (this.selectedFeatureIndices.length === 2) {
        this.points = this.selectedFeatureValues;
      }
      if (this.selectedFeatureIndices.length >= 3) {
        this.points = await this.computeProjection();
      }
    },
    async projectionMethod() {
      this.points = await this.computeProjection();
    },
    async featureValues() {
      this.points = await this.computeProjection();
    },
  },
  async mounted() {
    this.points = await this.computeProjection();
  },
  methods: {
    async computeProjection(): Promise<number[][] | null> {
      const {
        featureValues,
        selectedFeatureIndices,
        selectedFeatureValues,
        projectionMethod,
      } = this;

      if (
        featureValues.length === 0
        || featureValues[0] === undefined
        || featureValues[0].length === 0
      ) return null;
      if (selectedFeatureIndices.length === 0) return null;

      if (projectionMethod === ProjectionMethodType.PCA) {
        return projectionAPI.PCA(selectedFeatureValues, 2);
      }
      if (projectionMethod === ProjectionMethodType.MDS) {
        return projectionAPI.MDS(selectedFeatureValues, 2);
      }
      if (projectionMethod === ProjectionMethodType.TSNE) {
        return projectionAPI.TSNE(selectedFeatureValues, 2);
      }
      return null;
    },
  },
});
</script>

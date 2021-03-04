<template>
  <div
    style="border: 0.5px solid #757575"
  >
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
      @update-selected-feature-indices="onUpdateSelectedFeatureIndices"
      @click-projection-method="onClickProjectionMethod"
      @update-binning="onUpdateBinning"
      @update-subsampling="onUpdateSubsampling"
    />

    <!-- The dataset overview display. -->
    <VScatterplot
      v-if="!enableBinning"
      :points="pointsSampled"
      :uuids="uuidsSampled"
      :labels="labelsSampled"
      :statuses="statusesSampled"
      :query-indices="queryIndices"
      :x-axis="xAxis"
      :y-axis="yAxis"
      :x-extent="xExtent"
      :y-extent="yExtent"
      :label2color="label2color"
      @select-uuids="onSelectUuids"
    />
    <VHeatmap
      v-else
      :points="pointsSampled"
      :uuids="uuidsSampled"
      :labels="labelsSampled"
      :statuses="statusesSampled"
      :query-indices="queryIndices"
      :x-axis="xAxis"
      :y-axis="yAxis"
      :x-extent="xExtent"
      :y-extent="yExtent"
      :n-rows="binningNRows"
      :n-columns="binningNColumns"
      @select-uuids="onSelectUuids"
    />
  </div>
</template>

<script lang="ts">
import { xor4096 } from 'seedrandom';
import Vue, { PropType } from 'vue';
import * as projectionAPI from '@/services/projection-api';
import { Label, ProjectionMethodType, Status } from '@/commons/types';
import { Binning, Subsampling } from './types';
import VScatterplot from './VScatterplot.vue';
import VHeatmap from './VHeatmap.vue';
import VConfigurableProjectionHeader from './VConfigurableProjectionHeader.vue';

/** Randomly shuffle array. */
function randomShuffle<T>(
  array: T[],
  seed: string | undefined = undefined,
): T[] {
  const random = xor4096(seed);

  // Durstenfeld shuffle
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
    featureNames: {
      type: Array as PropType<string[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  data(): {
    points: number[][] | null,
    } {
    return {
      points: null,
    };
  },
  computed: {
    xAxis(): null | { label: string, tickNum: number } {
      const { selectedFeatureIndices, featureNames } = this;
      if (selectedFeatureIndices.length === 2) {
        return {
          label: featureNames[selectedFeatureIndices[0]],
          tickNum: 5,
        };
      }
      return null;
    },
    yAxis(): null | { label: string, tickNum: number } {
      const { selectedFeatureIndices, featureNames } = this;
      if (selectedFeatureIndices.length === 2) {
        return {
          label: featureNames[selectedFeatureIndices[1]],
          tickNum: 5,
        };
      }
      return null;
    },
    xExtent(): null | [number, number] {
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
    yExtent(): null | [number, number] {
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
    sampledDataObjectIndices(): null | number[] {
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
      const shuffled = randomShuffle(selection, seed);
      const indices = shuffled.slice(0, subsamplingNSamples);
      return indices;
    },
    pointsSampled(): number[][] | null {
      const { points, sampledDataObjectIndices } = this;
      if (points === null) {
        return null;
      }
      if (sampledDataObjectIndices === null) {
        return points;
      }
      return sampledDataObjectIndices.map((d: number) => (points as number[][])[d]);
    },
    uuidsSampled(): string[] {
      const { uuids, sampledDataObjectIndices } = this;
      if (sampledDataObjectIndices === null) {
        return uuids;
      }
      return sampledDataObjectIndices.map((d: number) => uuids[d]);
    },
    labelsSampled(): Label[] {
      const { labels, sampledDataObjectIndices } = this;
      if (sampledDataObjectIndices === null) {
        return labels;
      }
      return sampledDataObjectIndices.map((d: number) => labels[d]);
    },
    statusesSampled(): Status[] {
      const { statuses, sampledDataObjectIndices } = this;
      if (sampledDataObjectIndices === null) {
        return statuses;
      }
      return sampledDataObjectIndices.map((d: number) => statuses[d]);
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
    onUpdateSelectedFeatureIndices(selectedFeatureIndices: number[]) {
      this.$emit('update-selected-feature-indices', selectedFeatureIndices);
    },
    onClickProjectionMethod(projectionMethod: ProjectionMethodType) {
      this.$emit('click-projection-method', projectionMethod);
    },
    onUpdateBinning(binning: Binning) {
      this.$emit('update-binning', binning);
    },
    onUpdateSubsampling(subsampling: Subsampling) {
      this.$emit('update-subsampling', subsampling);
    },
    onSelectUuids(selectedUuids: string[]) {
      this.$emit('select-uuids', selectedUuids);
    },
  },
});
</script>

<template>
  <div
    ref="container"
    style="border: 0.5px solid #757575; display: flex;"
  >
    <!-- The configure projection attribute dialog button. -->
    <TheBodyTools
      :feature-names="featureNames"
      :selected-feature-indices="selectedFeatureIndices"
      :enable-subsampling="enableSubsampling"
      :subsampling-n-samples="subsamplingNSamples"
      @update:feature-indices="$emit('update:feature-indices', $event)"
      @update:subsampling="$emit('update:subsampling', $event)"
    />

    <!-- The dataset overview display. -->
    <svg
      width="100%"
      height="100%"
    >
      <VParallelCoordinates
        :data="featureValuesSampled"
        :width="width"
        :height="height"
        :margin="{ top: 40, right: 40, bottom: 10, left: 40 }"
      >
        <template #line="props">
          <path
            :d="props.d"
            :stroke="colormap(props.i)"
            :opacity="opacityMap(props.i)"
          />
        </template>
      </VParallelCoordinates>
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { useElementSize } from '@vueuse/core';
import { xor4096 } from 'seedrandom';
import type { Category, ILabelCategory } from '@/commons/types';
import { randomShuffle } from '@/plugins/random';
import VParallelCoordinates from './parallel-coordinates/VParallelCoordinates.vue';
import TheBodyTools from './TheBodyTools.vue';

export default defineComponent({
  name: 'TheBody',
  components: {
    VParallelCoordinates,
    TheBodyTools,
  },
  props: {
    selectedFeatureIndices: {
      type: Array as PropType<number[]>,
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
      type: Array as PropType<(Record<string, number> | undefined)[]>,
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
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  emits: {
    'update:feature-indices': null,
    'update:subsampling': null,
    'select:uuids': null,
  },
  setup() {
    const container = ref(null);
    const { width, height } = useElementSize(container);
    return { container, width, height };
  },
  computed: {
    nTotal(): number {
      return this.featureValues.length;
    },
    subsampleIndices(): number[] | null {
      const { nTotal, enableSubsampling, subsamplingNSamples } = this;
      if (enableSubsampling === false
        || nTotal <= subsamplingNSamples) {
        return null;
      }
      const selection = [...Array(nTotal).keys()];
      // The seed guarantees that given the same points,
      // the sample results are the same.
      const seed = `${nTotal}`;
      const shuffled = randomShuffle(selection, xor4096(seed));
      const indices = shuffled.slice(0, subsamplingNSamples);
      return indices;
    },
    featureValuesSampled(): (Record<string, number> | undefined)[] {
      const { featureValues, subsampleIndices } = this;
      if (subsampleIndices === null) return featureValues;
      return subsampleIndices.map((d: number) => featureValues[d]);
    },
    uuidsSampled(): string[] {
      const { uuids, subsampleIndices } = this;
      if (subsampleIndices === null) return uuids;
      return subsampleIndices.map((d: number) => uuids[d]);
    },
    colormap(): ((i: number) => string) {
      const {
        labels,
        label2color,
        subsampleIndices,
        unlabeledMark,
      } = this;
      if (labels === null) return () => label2color(unlabeledMark);
      if (subsampleIndices === null) {
        return (i: number) => label2color(labels[i]);
      }
      const labelsSampled = subsampleIndices
        .map((d: number) => labels[d]);
      return (i) => label2color(labelsSampled[i]);
    },
    opacityMap(): ((i: number) => number) {
      const {
        labels,
        queryUuids,
        uuidsSampled,
      } = this;
      if (labels === null || queryUuids.length === 0) return () => 1;
      const highlightIndices = uuidsSampled.map((d, i) => i)
        .filter((i) => queryUuids.includes(uuidsSampled[i]));
      return (i) => (highlightIndices.includes(i) ? 1 : 0.2);
    },
  },
});
</script>

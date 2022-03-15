<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    :style="styleCardElevated"
    style="display: flex; flex-direction: column;"
  >
    <TheHeader
      @window:minimize="$emit('update:task-window', { isMinimized: true })"
      @window:pin="$emit('update:task-window', { isPinned: true })"
    />
    <v-divider />
    <TheBody
      v-if="nTotal >= 2 && isFeatureValuesValid"
      :selected-feature-indices="selectedFeatureIndices"
      :enable-subsampling="subsampling.enabled"
      :subsampling-n-samples="subsampling.nSamples"
      :feature-values="featureValues"
      :uuids="uuids"
      :labels="labelCategories"
      :query-uuids="queryUuids"
      :feature-names="featureNames"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      style="flex: 1 1 auto; margin: 1px;"
      @update:feature-indices="selectedFeatureIndices = $event"
      @update:projection-method="onClickProjectionMethod($event, i)"
      @update:binning="onUpdateBinning($event, i)"
      @update:subsampling="subsampling = $event"
      @select:uuids="$emit('set:query-uuids', $event)"
    />
    <div
      v-else-if="nTotal <= 1"
      class="subtitle-1 mx-auto"
      style="flex: 1 1 auto; display: flex; align-items: center;"
    >
      Less Than 2 Data Objects Loaded
    </div>
    <div
      v-else
      class="subtitle-1 mx-auto"
      style="flex: 1 1 auto; display: flex; align-items: center;"
    >
      Feature Values not Computed
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type {
  Category,
  IDataObject,
  ILabel,
  ILabelCategory,
} from '@/commons/types';
import { cardElevated as styleCardElevated } from '@/style';
import type { Subsampling } from './types';
import TheHeader from './TheHeader.vue';
import TheBody from './TheBody.vue';

export default defineComponent({
  name: 'TheParallelCoordinates',
  components: {
    TheHeader,
    TheBody,
  },
  props: {
    dataObjects: {
      type: Array as PropType<IDataObject[]>,
      required: true,
    },
    labels: {
      type: Array as PropType<ILabel[]>,
      required: true,
    },
    queryUuids: {
      type: Array as PropType<string[]>,
      required: true,
    },
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
    featureNames: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  emits: {
    'update:task-window': null,
    'set:query-uuids': null,
  },
  data() {
    return {
      styleCardElevated,
      selectedFeatureIndices: [] as number[],
      subsampling: {
        enabled: false,
        nSamples: 100,
      } as Subsampling,
    };
  },
  computed: {
    nTotal(): number {
      return this.featureValues.length;
    },
    isFeatureValuesValid(): boolean {
      const { featureValues } = this;
      return Array.isArray(featureValues)
        && featureValues.every((d) => d !== undefined);
    },
    selectedFeatureNames(): string[] {
      const { featureNames, selectedFeatureIndices } = this;
      return selectedFeatureIndices.map((d) => featureNames[d]);
    },
    featureValues(): (Record<string, number> | undefined)[] {
      const { dataObjects, selectedFeatureNames } = this;
      return dataObjects.map((d) => {
        const { features } = d;
        if (features === undefined) return undefined;
        return Object.fromEntries(selectedFeatureNames
          .map((name, i) => [name, features[i]]));
      });
    },
    uuids(): string[] {
      const { dataObjects } = this;
      return dataObjects.map((d) => d.uuid);
    },
    labelCategories(): ILabelCategory[] {
      const { labels, unlabeledMark } = this;
      if (labels === null) return [];
      return labels.map((d) => d?.category ?? unlabeledMark);
    },
  },
  watch: {
    featureNames() {
      const { featureNames } = this;
      const nFeatures = featureNames.length;
      this.selectedFeatureIndices = [...new Array(nFeatures).keys()];
    },
  },
  mounted() {
    const { featureNames } = this;
    const nFeatures = featureNames.length;
    this.selectedFeatureIndices = [...new Array(nFeatures).keys()];
  },
});
</script>

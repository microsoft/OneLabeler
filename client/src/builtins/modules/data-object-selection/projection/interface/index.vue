<template>
  <div
    :style="styleCardElevated"
    style="display: flex; flex-direction: column;"
  >
    <TheHeader
      :n-rows="nRows"
      :n-columns="nColumns"
      @set:matrix-shape="onSetMatrixShape"
      @window:minimize="$emit('update:task-window', { isMinimized: true })"
      @window:pin="$emit('update:task-window', { isPinned: true })"
    />
    <v-divider />
    <div
      v-if="nTotal >= 2 && isFeatureValuesValid"
      style="flex: 1 1 auto; display: grid;"
      :style="{
        'grid-template-rows': `repeat(${nRows}, ${100/nRows}%)`,
        'grid-template-columns': `repeat(${nColumns}, ${100/nColumns}%)`,
      }"
    >
      <TheBody
        v-for="(view, i) in views"
        :key="view.id"
        :selected-feature-indices="view.featureSpace.selectedFeatureIndices"
        :projection-method="view.featureSpace.projectionMethod"
        :enable-binning="view.binning.enabled"
        :binning-n-rows="view.binning.nRows"
        :binning-n-columns="view.binning.nColumns"
        :enable-subsampling="view.subsampling.enabled"
        :subsampling-n-samples="view.subsampling.nSamples"
        :feature-values="featureValues"
        :uuids="uuids"
        :labels="labelCategories"
        :query-uuids="queryUuids"
        :feature-names="featureNames"
        :unlabeled-mark="unlabeledMark"
        :label2color="label2color"
        style="margin: 1px"
        @update:feature-indices="onUpdateSelectedFeatureIndices($event, i)"
        @update:projection-method="onClickProjectionMethod($event, i)"
        @update:binning="onUpdateBinning($event, i)"
        @update:subsampling="onUpdateSubsampling($event, i)"
        @select:uuids="$emit('set:query-uuids', $event)"
      />
    </div>
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
import { ProjectionMethodType } from '@/commons/types';
import type {
  Category,
  IDataObject,
  ILabel,
  ILabelCategory,
} from '@/commons/types';
import { cardElevated as styleCardElevated } from '@/style';
import type { Binning, Subsampling } from './types';
import TheHeader from './TheHeader.vue';
import TheBody from './TheBody.vue';

/** The type of a data object overview facet configuration. */
type FacetAttribute = {
  featureSpace: {
    selectedFeatureIndices: number[],
    projectionMethod: ProjectionMethodType,
  },
  binning: Binning,
  subsampling: Subsampling,
};

const createView = (nFeatures: number): FacetAttribute => ({
  featureSpace: {
    selectedFeatureIndices: new Array(nFeatures).fill(null).map((d, i) => i),
    projectionMethod: ProjectionMethodType.PCA,
  },
  binning: {
    enabled: false,
    nRows: 20,
    nColumns: 20,
  },
  subsampling: {
    enabled: false,
    nSamples: 100,
  },
});

export default defineComponent({
  name: 'TheProjectionView',
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
      nRows: 1,
      nColumns: 1,
      views: [] as FacetAttribute[],
    };
  },
  computed: {
    nTotal(): number {
      return this.featureValues.length;
    },
    isFeatureValuesValid(): boolean {
      const { featureValues } = this;
      return Array.isArray(featureValues)
        && featureValues.every((d) => Array.isArray(d));
    },
    featureValues(): (number[] | undefined)[] {
      const { dataObjects } = this;
      return dataObjects.map((d) => d?.features);
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
      const nFeatures = this.featureNames.length;
      this.views = this.views.map((view) => ({
        ...view,
        featureSpace: {
          ...view.featureSpace,
          selectedFeatureIndices: new Array(nFeatures).fill(null).map((d, i) => i),
        },
      }));
    },
  },
  mounted() {
    const { featureNames } = this;
    this.views = [createView(featureNames.length)];
  },
  methods: {
    onSetMatrixShape({ nRows, nColumns }: { nRows: number, nColumns: number}): void {
      this.nRows = nRows;
      this.nColumns = nColumns;
      if (this.views.length > nRows * nColumns) {
        this.views = this.views.slice(0, nRows * nColumns);
      } else if (this.views.length < nRows * nColumns) {
        const newViews = new Array(nRows * nColumns - this.views.length)
          .fill(0)
          .map(() => createView(this.featureNames.length));
        this.views = [
          ...this.views,
          ...newViews,
        ];
      }
    },
    onUpdateSelectedFeatureIndices(selectedFeatureIndices: number[], i: number): void {
      const updatedViews = [...this.views];
      updatedViews[i].featureSpace.selectedFeatureIndices = selectedFeatureIndices;
      this.views = updatedViews;
    },
    onClickProjectionMethod(projectionMethod: ProjectionMethodType, i: number): void {
      const updatedViews = [...this.views];
      updatedViews[i].featureSpace.projectionMethod = projectionMethod;
      this.views = updatedViews;
    },
    onUpdateBinning(binning: Binning, i: number): void {
      const updatedViews = [...this.views];
      updatedViews[i].binning = binning;
      this.views = updatedViews;
    },
    onUpdateSubsampling(subsampling: Subsampling, i: number): void {
      const updatedViews = [...this.views];
      updatedViews[i].subsampling = subsampling;
      this.views = updatedViews;
    },
  },
});
</script>

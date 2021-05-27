<template>
  <v-card>
    <TheProjectionViewHeader
      :n-rows="nRows"
      :n-columns="nColumns"
      @set:matrix-shape="onSetMatrixShape"
      @window:minimize="onWindowMinimize"
      @window:pin="onWindowPin"
    />
    <v-divider />
    <div
      ref="container"
      style="height: calc(100% - 30px); display: flex; align-items: center;"
    >
      <div
        v-if="nTotal >= 2 && isFeatureValuesValid"
        :style="{
          height: '100%',
          width: '100%',
          display: 'grid',
          'grid-template-rows': `repeat(${nRows}, ${100/nRows}%)`,
          'grid-template-columns': `repeat(${nColumns}, ${100/nColumns}%)`,
        }"
      >
        <VConfigurableProjection
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
          :label2color="label2color"
          style="margin: 1px"
          @update:feature-indices="onUpdateSelectedFeatureIndices($event, i)"
          @click:projection-method="onClickProjectionMethod($event, i)"
          @update:binning="onUpdateBinning($event, i)"
          @update:subsampling="onUpdateSubsampling($event, i)"
          @select:uuids="onSelectUuids"
        />
      </div>
      <p
        v-else-if="nTotal <= 1"
        class="mx-auto subtitle-1"
      >
        Less Than 2 Data Objects Loaded
      </p>
      <p
        v-else
        class="mx-auto subtitle-1"
      >
        Feature Values not Computed
      </p>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import {
  IDataObjectStorage,
  ILabelCategory,
  ILabelStorage,
  ProjectionMethodType,
  TaskWindow,
} from '@/commons/types';
import { Binning, Subsampling } from './types';
import TheProjectionViewHeader from './TheProjectionViewHeader.vue';
import VConfigurableProjection from './VConfigurableProjection.vue';

/** The type of a data object overview facet configuration. */
type FacetAttribute = {
  /** The id to be bound to the element key to trigger render. */
  id: string,
  featureSpace: {
    selectedFeatureIndices: number[],
    projectionMethod: ProjectionMethodType,
  },
  binning: Binning,
  subsampling: Subsampling,
};

const randomBigInt = () => Math.floor(Math.random() * 100000000);

const createView = (nFeatures: number): FacetAttribute => ({
  id: `${randomBigInt()}`,
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

export default Vue.extend({
  name: 'TheProjectionView',
  components: {
    TheProjectionViewHeader,
    VConfigurableProjection,
  },
  props: {
    taskWindow: {
      type: Object as PropType<TaskWindow>,
      required: true,
    },
  },
  data() {
    return {
      featureValues: [] as number[][],
      uuids: [] as string[],
      labelCategories: [] as ILabelCategory[],
      resizeObserver: null as ResizeObserver | null,
      nRows: 1,
      nColumns: 1,
      views: [] as FacetAttribute[],
    };
  },
  computed: {
    ...mapState([
      'dataObjects',
      'labels',
      'featureNames',
      'queryUuids',
      'scopeUuids',
    ]),
    ...mapState('workflow', ['currentNode']),
    ...mapGetters(['label2color']),
    ...mapGetters('workflow', ['nextNodes']),
    nTotal(): number {
      return this.featureValues.length;
    },
    isFeatureValuesValid(): boolean {
      const { featureValues } = this;
      return Array.isArray(featureValues)
        && featureValues.every((d) => Array.isArray(d));
    },
  },
  watch: {
    async dataObjects() {
      this.featureValues = await this.getFeatureValues() as number[][];
      this.uuids = await this.getUuids();
    },
    async scopeUuids() {
      this.featureValues = await this.getFeatureValues() as number[][];
      this.uuids = await this.getUuids();
    },
    async uuids() {
      this.labelCategories = await this.getLabelCategories() as ILabelCategory[];
    },
    async labels() {
      this.labelCategories = await this.getLabelCategories() as ILabelCategory[];
    },
    featureValues() {
      this.forceViewsUpdate();
    },
    featureNames() {
      // change the id to force view update
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
  beforeDestroy(): void {
    // Unbind resize observer.
    (this.resizeObserver as ResizeObserver).disconnect();
  },
  mounted() {
    const { featureNames } = this;
    this.views = [createView(featureNames.length)];

    // Bind resize observer,
    // rerender the scatter plots when the div containing the svg(s) change size.
    // TODO: when resized, the configurable projection component
    // is rerendered, and the projection is also recomputed, which is unnecessary.
    this.resizeObserver = new ResizeObserver(this.forceViewsUpdate);
    this.resizeObserver.observe(this.$refs.container as HTMLElement);
  },
  methods: {
    ...mapActions(['editTaskWindow']),
    ...mapActions('workflow', [
      'executeDataObjectSelectionManual',
      'executeWorkflow',
    ]),
    onWindowMinimize() {
      const { taskWindow } = this;
      this.editTaskWindow({
        ...taskWindow,
        isMinimized: true,
      });
    },
    onWindowPin() {
      const { taskWindow } = this;
      this.editTaskWindow({
        ...taskWindow,
        isPinned: true,
      });
    },
    async onSelectUuids(uuids: string[]): Promise<void> {
      if (uuids.length === 0) return;
      const { taskWindow } = this;
      await this.executeDataObjectSelectionManual(uuids);
      if (this.nextNodes === null || this.nextNodes.length !== 1) return;

      // await this.executeWorkflow(this.nextNodes[0]);
      await this.executeWorkflow(taskWindow.node);
    },
    onSetMatrixShape(nRows: number, nColumns: number) {
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
      // change the id to force view update
      this.views = this.views.map((view) => ({ ...view, id: `${randomBigInt()}` }));
    },
    onUpdateSelectedFeatureIndices(selectedFeatureIndices: number[], i: number) {
      const updatedViews = [...this.views];
      updatedViews[i].featureSpace.selectedFeatureIndices = selectedFeatureIndices;
      this.views = updatedViews;
    },
    onClickProjectionMethod(projectionMethod: ProjectionMethodType, i: number) {
      const updatedViews = [...this.views];
      updatedViews[i].featureSpace.projectionMethod = projectionMethod;
      this.views = updatedViews;
    },
    onUpdateBinning(binning: Binning, i: number) {
      const updatedViews = [...this.views];
      updatedViews[i].binning = binning;
      this.views = updatedViews;
    },
    onUpdateSubsampling(subsampling: Subsampling, i: number) {
      const updatedViews = [...this.views];
      updatedViews[i].subsampling = subsampling;
      this.views = updatedViews;
    },
    forceViewsUpdate() {
      // change the id to force view update
      this.views = this.views.map((view) => ({ ...view, id: `${randomBigInt()}` }));
    },
    async getFeatureValues(): Promise<(number[] | undefined)[]> {
      const { dataObjects } = this as { dataObjects: IDataObjectStorage | null };
      if (dataObjects === null) return [];
      const promiseDataObjects = this.scopeUuids === null
        ? dataObjects.getAll()
        : dataObjects.getBulk(this.scopeUuids);
      return (await promiseDataObjects)
        .map((d) => (d === undefined ? undefined : d.features));
    },
    async getUuids(): Promise<string[]> {
      const { dataObjects } = this as { dataObjects: IDataObjectStorage | null };
      if (dataObjects === null) return [];
      if (this.scopeUuids !== null) {
        return this.scopeUuids as string[];
      }
      return dataObjects.uuids();
    },
    async getLabelCategories(): Promise<(ILabelCategory | undefined)[]> {
      const { uuids } = this;
      const { labels } = this as { labels: ILabelStorage | null };
      if (labels === null) return [];
      const labelCategories = (await ((labels).getBulk(uuids)))
        .map((d) => (d === undefined ? undefined : d.category));
      return labelCategories;
    },
  },
});
</script>

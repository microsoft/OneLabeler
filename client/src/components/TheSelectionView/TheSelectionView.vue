<template>
  <component
    :is="component"
    :data-objects="scopedDataObjects"
    :labels="scopedLabels"
    :query-uuids="scopedQueryUuids"
    :unlabeled-mark="unlabeledMark"
    :label2color="label2color"
    :feature-names="featureNames"
    :task-window="taskWindow"
    style="height: 100%"
    @user-select-uuids="onUserSelectUuids"
    @edit-task-window="onEditTaskWindow"
  />
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  TaskWindow,
  WorkflowNodeType,
} from '@/commons/types';
import TheImageOverview from '@/components/TheImageOverview/TheImageOverview.vue';
import TheProjectionView from '@/components/TheProjectionView/TheProjectionView.vue';

export default Vue.extend({
  name: 'TheSelectionView',
  props: {
    taskWindow: {
      type: Object as PropType<TaskWindow>,
      required: true,
    },
  },
  data() {
    return {
      scopedDataObjects: [] as IDataObject[],
      scopedLabels: [] as ILabel[],
      scopedQueryUuids: [] as string[],
    };
  },
  computed: {
    ...mapState([
      'dataObjects',
      'labels',
      'queryUuids',
      'scopeUuids',
      'unlabeledMark',
      'featureNames',
    ]),
    ...mapGetters(['label2color']),
    ...mapGetters('workflow', ['nextNodes']),
    component(): VueConstructor | null {
      const { node, process } = this.taskWindow;
      if (node.type !== WorkflowNodeType.DataObjectSelection) return null;
      if (process.api === 'Projection') return TheProjectionView;
      if (process.api === 'ImageOverview') return TheImageOverview;
      return null;
    },
  },
  watch: {
    async dataObjects() {
      const scopedDataObjects = await this.getScopedDataObjects();
      const scopedLabels = await this.getScopedLabels();
      this.scopedDataObjects = scopedDataObjects;
      this.scopedLabels = scopedLabels;
    },
    async labels() {
      this.scopedLabels = await this.getScopedLabels();
    },
    queryUuids() {
      this.scopedQueryUuids = this.getScopedQueryUuids();
    },
    async scopeUuids() {
      // Note: await the computation then set the values together
      // to ensure [dataObjects, labels, statuses] almost always
      // have the same length.
      const scopedDataObjects = await this.getScopedDataObjects();
      const scopedLabels = await this.getScopedLabels();
      const scopedQueryUuids = this.getScopedQueryUuids();
      this.scopedDataObjects = scopedDataObjects;
      this.scopedLabels = scopedLabels;
      this.scopedQueryUuids = scopedQueryUuids;
    },
  },
  async mounted() {
    const scopedDataObjects = await this.getScopedDataObjects();
    const scopedLabels = await this.getScopedLabels();
    const scopedQueryUuids = this.getScopedQueryUuids();
    this.scopedDataObjects = scopedDataObjects;
    this.scopedLabels = scopedLabels;
    this.scopedQueryUuids = scopedQueryUuids;
  },
  methods: {
    ...mapActions(['editTaskWindow']),
    ...mapActions('workflow', [
      'executeDataObjectSelectionManual',
      'executeWorkflow',
    ]),
    async onUserSelectUuids(uuids: string[]): Promise<void> {
      if (uuids.length === 0) return;
      const { taskWindow } = this;
      await this.executeDataObjectSelectionManual(uuids);
      if (this.nextNodes === null || this.nextNodes.length !== 1) return;

      // await this.executeWorkflow(this.nextNodes[0]);
      await this.executeWorkflow(taskWindow.node);
    },
    onEditTaskWindow(newValue: Partial<TaskWindow>): void {
      const { taskWindow } = this;
      this.editTaskWindow({
        ...taskWindow,
        ...newValue,
      });
    },
    async getScopedDataObjects(): Promise<IDataObject[]> {
      const scopeUuids = this.scopeUuids as string[] | null;
      const dataObjects = this.dataObjects as IDataObjectStorage | null;
      if (dataObjects === null) return [];
      if (scopeUuids === null) return dataObjects.getAll();
      return dataObjects.getBulk(scopeUuids) as Promise<IDataObject[]>;
    },
    async getScopedLabels(): Promise<ILabel[]> {
      const dataObjects = this.dataObjects as IDataObjectStorage | null;
      const scopeUuids = this.scopeUuids as string[] | null;
      const labels = this.labels as ILabelStorage | null;
      if (dataObjects === null) return [];
      if (labels === null) return [];
      const uuids = scopeUuids ?? await dataObjects.uuids();
      const scopedLabels: ILabel[] = (await labels.getBulk(uuids))
        .map((d, i) => (d ?? { uuid: uuids[i] }));
      return scopedLabels;
    },
    getScopedQueryUuids(): string[] {
      const scopeUuids = this.scopeUuids as string[] | null;
      const queryUuids = this.queryUuids as string[];
      if (scopeUuids === null) return queryUuids;
      return queryUuids.filter((d) => scopeUuids.includes(d));
    },
  },
});
</script>

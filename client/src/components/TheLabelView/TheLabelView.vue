<template>
  <component
    :is="component"
    v-if="ready"
    :data-objects="queriedDataObjects"
    :labels="queriedLabels"
    :statuses="queriedStatuses.map((d) => d.value)"
    :task-window="taskWindow"
    :label-tasks="labelTasks"
    :data-type="dataType"
    :category-tasks="categoryTasks"
    :unlabeled-mark="unlabeledMark"
    :label2color="label2color"
    @user-edit-label="onUserEditLabel"
    @user-edit-labels="onUserEditLabels"
    @edit-task-window="editTaskWindow({ ...taskWindow, ...$event })"
  />
</template>

<script lang="ts">
import type { PropType, VueConstructor } from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import { StatusType, WorkflowNodeType } from '@/commons/types';
import type {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  IStatus,
  IStatusStorage,
  TaskWindow,
} from '@/commons/types';
import TheGridMatrix from '@/components/TheGridMatrix/TheGridMatrix.vue';
import TheSingleObjectDisplay from '@/components/TheSingleObjectDisplay/TheSingleObjectDisplay.vue';

const clean: (<T>(d: T) => T) = (d) => Object.fromEntries(
  Object.entries(d).filter(([, v]) => v != null),
) as (typeof d);

export default {
  name: 'TheLabelView',
  props: {
    taskWindow: {
      type: Object as PropType<TaskWindow>,
      required: true,
    },
  },
  data() {
    return {
      queriedDataObjects: [] as IDataObject[],
      queriedLabels: [] as ILabel[],
      queriedStatuses: [] as IStatus[],
    };
  },
  computed: {
    ...mapState([
      'dataObjects',
      'labels',
      'statuses',
      'queryUuids',
      'categoryTasks',
      'unlabeledMark',
    ]),
    ...mapGetters(['label2color']),
    ...mapGetters('workflow', ['dataType', 'labelTasks']),
    component(): VueConstructor | null {
      const { node, process } = this.taskWindow;
      if (node.type !== WorkflowNodeType.InteractiveLabeling) return null;
      if (process.api === 'SingleObjectDisplay') return TheSingleObjectDisplay;
      if (process.api === 'GridMatrix') return TheGridMatrix;
      return null;
    },
    ready(): boolean {
      return (this.queriedDataObjects.length === this.queriedLabels.length)
       && (this.queriedDataObjects.length === this.queriedStatuses.length);
    },
  },
  watch: {
    async dataObjects() {
      this.queriedDataObjects = await this.getQueriedDataObjects();
    },
    async labels() {
      this.queriedLabels = await this.getQueriedLabels();
    },
    async statuses() {
      this.queriedStatuses = await this.getQueriedStatuses();
    },
    async queryUuids() {
      // Note: await the computation then set the values together
      // to ensure [dataObjects, labels, statuses] almost always
      // have the same length.
      const queriedDataObjects = await this.getQueriedDataObjects();
      const queriedLabels = await this.getQueriedLabels();
      const queriedStatuses = await this.getQueriedStatuses();
      this.queriedDataObjects = queriedDataObjects;
      this.queriedLabels = queriedLabels;
      this.queriedStatuses = queriedStatuses;
    },
  },
  async mounted() {
    const queriedDataObjects = await this.getQueriedDataObjects();
    const queriedLabels = await this.getQueriedLabels();
    const queriedStatuses = await this.getQueriedStatuses();
    this.queriedDataObjects = queriedDataObjects;
    this.queriedLabels = queriedLabels;
    this.queriedStatuses = queriedStatuses;
  },
  methods: {
    ...mapActions([
      'editTaskWindow',
      'pushCommandHistory',
      'setLabelOf',
      'setLabelsOf',
      'setStatusOf',
      'setStatusesOf',
    ]),
    async onUserEditLabel(uuid: string, newValue: Partial<ILabel>) {
      const { labels } = this as { labels: ILabelStorage };
      const label: ILabel | undefined = await labels.get(uuid);
      const labelUpdated = label === undefined
        ? { uuid, ...newValue }
        : { ...label, ...newValue };
      await this.setLabelOf(labelUpdated);
      await this.setStatusOf({ uuid, value: StatusType.Labeled } as IStatus);

      /*
      const oldLabel = this.getLabel(dataObject.uuid);
      const editSingle = (d: IDataObject, l: ILabelCategory): void => {
        this.setLabelCategoryOf({ uuid: d.uuid, label: l });
        this.setStatusOf({ uuid: d.uuid, value: StatusType.Labeled });
      };
      const editSingleCommand = new EditSingleCommand(dataObject, oldLabel, label, editSingle);
      editSingleCommand.execute();
      this.pushCommandHistory(editSingleCommand);
      */
    },
    async onUserEditLabels(uuids: string[], newValues: Partial<ILabel>[]) {
      const { labels } = this as { labels: ILabelStorage | null };
      if (labels === null) return;
      const updatedLabels: ILabel[] = (await labels.getBulk(uuids)).map((label, i) => (
        label === undefined
          ? { uuid: uuids[i], ...newValues[i] }
          : { ...label, ...newValues[i] }
      ));
      const updatedStatuses: IStatus[] = uuids.map((uuid) => (
        { uuid, value: StatusType.Labeled }
      ));
      await this.setLabelsOf(updatedLabels);
      await this.setStatusesOf(updatedStatuses);

      /*
      const nBatch = dataObjects.length;
      const oldLabels = dataObjects.map((dataObject: IDataObject) => (
        this.getLabel(dataObject.uuid)
      ));
      const newLabels = Array(nBatch).fill(label);
      const editBatch = (ds: IDataObject[], ls: ILabelCategory[]): void => {
        this.setLabelCategoriesOf({
          uuids: ds.map((d: IDataObject) => d.uuid),
          labels: ls,
        });
        this.setStatusesOf(ds.map(() => StatusType.Labeled));
      };
      const editBatchCommand = new EditBatchCommand(dataObjects, oldLabels, newLabels, editBatch);
      editBatchCommand.execute();
      this.pushCommandHistory(editBatchCommand);
      */
    },
    async getQueriedDataObjects(): Promise<IDataObject[]> {
      const queryUuids = this.queryUuids as string[];
      const dataObjects = this.dataObjects as IDataObjectStorage | null;
      if (dataObjects === null) return [];
      return (await dataObjects.getBulk(queryUuids)) as IDataObject[];
    },
    async getQueriedLabels(): Promise<ILabel[]> {
      const queryUuids = this.queryUuids as string[];
      const labels = this.labels as ILabelStorage | null;
      if (labels === null) return [];

      const queriedLabels: ILabel[] = (await labels.getBulk(queryUuids))
        .map((d, i) => {
          if (d === undefined) return { uuid: queryUuids[i] };
          return { ...clean(d) };
        });
      return queriedLabels;
    },
    async getQueriedStatuses(): Promise<IStatus[]> {
      const queryUuids = this.queryUuids as string[];
      const statuses = this.statuses as IStatusStorage | null;
      if (statuses === null) return [];
      const queriedStatuses: IStatus[] = (await statuses.getBulk(queryUuids))
        .map((d, i) => (d !== undefined ? d : { uuid: queryUuids[i], value: StatusType.New }));
      return queriedStatuses;
    },
  },
};
</script>

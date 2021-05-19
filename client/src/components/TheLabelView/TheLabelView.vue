<template>
  <component
    v-if="ready"
    :is="component"
    :data-objects="queriedDataObjects"
    :labels="queriedLabels"
    :statuses="queriedStatuses.map((d) => d.value)"
    :task-window="taskWindow"
    :data-type="dataType"
    :label-tasks="labelTasks"
    :classes="classes"
    :unlabeled-mark="unlabeledMark"
    :label2color="label2color"
    style="height: 100%;"
    @user-edit-label="onUserEditLabel"
    @user-edit-labels="onUserEditLabels"
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
  IStatus,
  IStatusStorage,
  StatusType,
  TaskWindow,
  WorkflowNodeType,
} from '@/commons/types';
import TheCardMatrix from '@/components/TheCardMatrix/TheCardMatrix.vue';
import ThePaintBoard from '@/components/ThePaintBoard/ThePaintBoard.vue';

export default Vue.extend({
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
      'classes',
      'unlabeledMark',
    ]),
    ...mapGetters(['label2color']),
    ...mapGetters('workflow', [
      'dataType',
      'labelTasks',
    ]),
    component(): VueConstructor | null {
      const { node, process } = this.taskWindow;
      if (node.type !== WorkflowNodeType.InteractiveLabeling) return null;
      if (process.api === 'SingleObjectDisplay') return ThePaintBoard;
      if (process.api === 'GridMatrix') return TheCardMatrix;
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
      const label = await labels.get(uuid);
      if (label !== undefined) {
        await this.setLabelOf({ ...label, ...newValue } as ILabel);
      }
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
      const { labels } = this as { labels: ILabelStorage };
      const updatedLabels = (await labels.getBulk(uuids)).map((label, i) => ({
        ...label,
        ...newValues[i],
      })) as ILabel[];
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
    onEditTaskWindow(newValue: Partial<TaskWindow>) {
      const { taskWindow } = this;
      this.editTaskWindow({
        ...taskWindow,
        ...newValue,
      });
    },
    async getQueriedDataObjects(): Promise<IDataObject[]> {
      const queryUuids = this.queryUuids as string[];
      const dataObjects = this.dataObjects as IDataObjectStorage | null;
      return dataObjects === null
        ? []
        : (await dataObjects.getBulk(queryUuids)) as IDataObject[];
    },
    async getQueriedLabels(): Promise<ILabel[]> {
      const queryUuids = this.queryUuids as string[];
      const labels = this.labels as ILabelStorage | null;
      return labels === null
        ? []
        : (await labels.getBulk(queryUuids)) as ILabel[];
    },
    async getQueriedStatuses(): Promise<IStatus[]> {
      const queryUuids = this.queryUuids as string[];
      const statuses = this.statuses as IStatusStorage | null;
      return statuses === null
        ? []
        : (await statuses.getBulk(queryUuids)) as IStatus[];
    },
  },
});
</script>

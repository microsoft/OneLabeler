<template>
  <component
    :is="getComponent(taskWindow)"
    :data-objects="dataObjects"
    :labels="labels"
    :statuses="statuses"
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
  ILabel,
  IStatus,
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
  computed: {
    ...mapState([
      'classes',
      'unlabeledMark',
    ]),
    ...mapGetters([
      'sampledDataObjects',
      'sampledLabels',
      'sampledStatuses',
      'label2color',
    ]),
    ...mapGetters('workflow', [
      'dataType',
      'labelTasks',
    ]),
    dataObjects(): IDataObject[] {
      return this.sampledDataObjects;
    },
    labels(): ILabel[] {
      return this.sampledLabels;
    },
    statuses(): StatusType[] {
      return (this.sampledStatuses as IStatus[]).map((d) => d.value);
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
    getComponent(taskWindow: TaskWindow): VueConstructor | null {
      const { node, process } = taskWindow;
      if (node.type !== WorkflowNodeType.InteractiveLabeling) return null;
      if (process.api === 'SingleObjectDisplay') return ThePaintBoard;
      if (process.api === 'GridMatrix') return TheCardMatrix;
      return null;
    },
    onUserEditLabel(uuid: string, newValue: Partial<ILabel>) {
      const { labels } = this as { labels: ILabel[] };
      const label = labels.find((d) => d.uuid === uuid);
      if (label === undefined) return;
      const updatedLabel: ILabel = { ...label, ...newValue };
      this.setLabelOf({ uuid, label: updatedLabel });
      const updatedStatus: IStatus = { uuid, value: StatusType.Labeled };
      this.setStatusOf({ uuid, status: updatedStatus });

      /*
      const oldLabel = this.getLabel(dataObject.uuid);
      const editSingle = (d: IDataObject, l: ILabelCategory): void => {
        this.setLabelCategoryOf({ uuid: d.uuid, label: l });
        this.setStatusOf({ uuid: d.uuid, status: StatusType.Labeled });
      };
      const editSingleCommand = new EditSingleCommand(dataObject, oldLabel, label, editSingle);
      editSingleCommand.execute();
      this.pushCommandHistory(editSingleCommand);
      */
    },
    onUserEditLabels(uuids: string[], newValues: Partial<ILabel>[]) {
      const { labels } = this as { labels: ILabel[] };
      const updatedLabels = uuids.map((uuid, i) => {
        const label = labels.find((d) => d.uuid === uuid);
        const newValue = newValues[i];
        return { ...label, ...newValue } as ILabel;
      });
      const updatedStatuses: IStatus[] = uuids.map((uuid) => (
        { uuid, value: StatusType.Labeled }
      ));
      this.setLabelsOf({ uuids, labels: updatedLabels });
      this.setStatusesOf({ uuids, statuses: updatedStatuses });

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
        this.setStatusesOf({
          uuids: ds.map((d: IDataObject) => d.uuid),
          statuses: ds.map(() => StatusType.Labeled),
        });
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
  },
});
</script>

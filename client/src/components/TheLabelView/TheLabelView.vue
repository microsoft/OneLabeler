<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <BaseLabelView
    :task-window="taskWindow"
    :data-objects="dataObjects"
    :labels="labels"
    :statuses="statuses"
    :query-uuids="queryUuids"
    :category-tasks="categoryTasks"
    :unlabeled-mark="unlabeledMark"
    :label2color="label2color"
    :data-type="dataType"
    :label-tasks="labelTasks"
    @upsert:labels="onUpsertLabels"
    @upsert-bulk:labels="onUpsertBulkLabels"
    @update:task-window="updateTaskWindow({ ...taskWindow, ...$event })"
  />
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import { StatusType } from '@/commons/types';
import type {
  ILabel,
  ILabelStorage,
  IStatus,
  TaskWindow,
} from '@/commons/types';
import BaseLabelView from './BaseLabelView.vue';

export default {
  name: 'TheLabelView',
  components: { BaseLabelView },
  props: {
    taskWindow: {
      type: Object as PropType<TaskWindow>,
      required: true,
    },
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
  },
  methods: {
    ...mapActions([
      'updateTaskWindow',
      'pushCommandHistory',
      'setLabelOf',
      'setLabelsOf',
      'setStatusOf',
      'setStatusesOf',
    ]),
    async onUpsertLabels(newValue: Partial<ILabel> & { uuid: string }): Promise<void> {
      const { uuid } = newValue;
      const { labels } = this as { labels: ILabelStorage };
      const label: ILabel | undefined = await labels.get(uuid);
      const labelUpdated = { ...label, ...newValue };
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
    async onUpsertBulkLabels(newValues: (Partial<ILabel> & { uuid: string })[]) {
      const { labels } = this as { labels: ILabelStorage | null };
      if (labels === null) return;
      const uuids = newValues.map((d) => d.uuid);
      const updatedLabels: ILabel[] = (await labels.getBulk(uuids)).map((label, i) => (
        { ...label, ...newValues[i] }
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
  },
};
</script>

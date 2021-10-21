<template>
  <v-card style="display: flex; flex-direction: column;">
    <TheGridMatrixHeader
      :data-type="dataType"
      :label-tasks="labelTasks"
      :category-tasks="categoryTasks"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      @upsert-bulk:label="onUpsertBulkLabel"
      @window:minimize="$emit('edit-task-window', { isMinimized: true })"
      @window:pin="$emit('edit-task-window', { isPinned: true })"
    />
    <v-divider />
    <div style="flex: 1 1 auto; display: flex; align-items: center;">
      <VGridMatrix
        v-if="dataObjects.length !== 0"
        style="height: 100%; width: 100%;"
        :data-type="dataType"
        :label-tasks="labelTasks"
        :data-objects="dataObjects"
        :labels="labels"
        :statuses="statuses"
        :category-tasks="categoryTasks"
        :selected-uuids="selectedUuids"
        :items-per-row="itemsPerRow"
        :items-per-col="itemsPerCol"
        :label2color="label2color"
        @upsert:label="onUpsertLabel"
        @click:grid="onClickGrid"
      />
      <p
        v-else
        class="mx-auto subtitle-1"
      >
        No Data Objects Queried
      </p>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { cloneDeep } from 'lodash';
import {
  DataType,
  IDataObject,
  ILabel,
  LabelTaskType,
  StatusType,
  TaskWindow,
  Category,
} from '@/commons/types';
import VGridMatrix from './VGridMatrix.vue';
import TheGridMatrixHeader from './TheGridMatrixHeader.vue';

export default Vue.extend({
  name: 'TheGridMatrix',
  components: {
    VGridMatrix,
    TheGridMatrixHeader,
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
    statuses: {
      type: Array as PropType<StatusType[]>,
      required: true,
    },
    taskWindow: {
      type: Object as PropType<TaskWindow>,
      required: true,
    },
    dataType: {
      type: String as PropType<DataType>,
      // In case the interface is created before data type is selected.
      default: null,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
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
  },
  data() {
    return {
      selectedUuids: [] as string[],
    };
  },
  computed: {
    itemsPerRow(): number {
      return this.taskWindow.process.params?.nColumns.value as number;
    },
    itemsPerCol(): number {
      return this.taskWindow.process.params?.nRows.value as number;
    },
  },
  methods: {
    onUpsertBulkLabel(partialLabel: Partial<ILabel>): void {
      const { selectedUuids, dataObjects } = this;
      // If multi-selection is applied, set the labels for the selected objects.
      const uuids = selectedUuids.length !== 0
        ? selectedUuids
        : dataObjects.map((d) => d.uuid);
      const newValues: Partial<ILabel>[] = new Array(uuids.length)
        .fill(null).map(() => cloneDeep(partialLabel));
      this.$emit('user-edit-labels', uuids, newValues);
    },
    onUpsertLabel(uuid: string, partialLabel: Partial<ILabel>): void {
      this.$emit('user-edit-label', uuid, partialLabel);
    },
    onClickGrid(dataObject: IDataObject, e: MouseEvent): void {
      const { uuid } = dataObject;
      const { ctrlKey } = e;
      if (!ctrlKey) {
        this.selectedUuids = [];
        return;
      }
      const { selectedUuids } = this;
      const idx = selectedUuids.findIndex((d) => d === uuid);
      this.selectedUuids = idx >= 0
        ? [...selectedUuids.slice(0, idx), ...selectedUuids.slice(idx + 1)]
        : [...selectedUuids, uuid];
    },
  },
});
</script>

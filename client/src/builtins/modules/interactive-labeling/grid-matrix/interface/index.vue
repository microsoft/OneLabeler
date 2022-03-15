<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    :style="styleCardElevated"
    style="display: flex; flex-direction: column;"
  >
    <TheHeader
      :data-type="dataType"
      :label-tasks="labelTasks"
      :category-tasks="categoryTasks"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      @upsert-bulk:labels="onUpsertBulkLabels"
      @window:minimize="$emit('update:task-window', { isMinimized: true })"
      @window:pin="$emit('update:task-window', { isPinned: true })"
    />
    <v-divider />
    <TheBody
      v-if="dataObjects.length !== 0"
      style="flex: 1 1 auto"
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
      @upsert:labels="$emit('upsert:labels', $event)"
      @click:grid="onClickGrid"
    />
    <div
      v-else
      class="subtitle-1 mx-auto"
      style="flex: 1 1 auto; display: flex; align-items: center;"
    >
      No Data Objects Queried
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { cloneDeep } from 'lodash';
import type {
  DataType,
  IDataObject,
  ILabel,
  LabelTaskType,
  LabelUpsertQuery,
  StatusType,
  TaskWindow,
  Category,
} from '@/commons/types';
import { cardElevated as styleCardElevated } from '@/style';
import TheBody from './TheBody.vue';
import TheHeader from './TheHeader.vue';

export default defineComponent({
  name: 'TheGridMatrix',
  components: {
    TheBody,
    TheHeader,
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
  emits: {
    'update:task-window': null,
    'upsert:labels': null,
    'upsert-bulk:labels': null,
  },
  data() {
    return {
      styleCardElevated,
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
    onUpsertBulkLabels(partialLabel: Partial<ILabel>): void {
      const { selectedUuids, dataObjects } = this;
      // If multi-selection is applied, set the labels for the selected objects.
      const uuids = selectedUuids.length !== 0
        ? selectedUuids
        : dataObjects.map((d) => d.uuid);
      const queries: LabelUpsertQuery[] = uuids
        .map((uuid) => ({ uuid, ...cloneDeep(partialLabel) }));
      this.$emit('upsert-bulk:labels', queries);
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

<template>
  <v-card style="display: flex; flex-direction: column;">
    <TheCardMatrixHeader
      :data-type="dataType"
      :label-tasks="labelTasks"
      :classes="classes"
      :category-tasks="categoryTasks"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      @set:label-batch-category="onSetLabelBatchCategory"
      @window:minimize="onWindowMinimize"
      @window:pin="onWindowPin"
    />
    <v-divider />
    <div style="flex: 1 1 auto; display: flex; align-items: center;">
      <VCardMatrix
        v-if="dataObjects.length !== 0"
        style="height: 100%; width: 100%;"
        :data-type="dataType"
        :label-tasks="labelTasks"
        :data-objects="dataObjects"
        :labels="labels"
        :statuses="statuses"
        :classes="classes"
        :category-tasks="categoryTasks"
        :selected-uuids="selectedUuids"
        :items-per-row="itemsPerRow"
        :items-per-col="itemsPerCol"
        :label2color="label2color"
        @set:label-category="onSetLabelCategory"
        @set:label-multi-category="onSetLabelMultiCategory"
        @set:label-text="onSetLabelText"
        @click:card="onClickCard"
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
import {
  DataType,
  IDataObject,
  ILabel,
  ILabelCategory,
  ILabelText,
  LabelTaskType,
  StatusType,
  TaskWindow,
  Category,
  ILabelMultiCategory,
} from '@/commons/types';
import VCardMatrix from './VCardMatrix.vue';
import TheCardMatrixHeader from './TheCardMatrixHeader.vue';

export default Vue.extend({
  name: 'TheCardMatrix',
  components: {
    VCardMatrix,
    TheCardMatrixHeader,
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
      required: true,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    classes: {
      type: Array as PropType<Category[]>,
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
      return this.taskWindow.process.params?.nRows.value as number;
    },
    itemsPerCol(): number {
      return this.taskWindow.process.params?.nColumns.value as number;
    },
  },
  methods: {
    onSetLabelBatchCategory(category: Category): void {
      const { selectedUuids, dataObjects } = this;
      // If multi-selection is applied, set the labels for the selected objects.
      const uuids = selectedUuids.length !== 0
        ? selectedUuids
        : dataObjects.map((d) => d.uuid);
      const newValues: Partial<ILabel>[] = new Array(uuids.length)
        .fill(null).map(() => ({ category }));
      this.$emit('user-edit-labels', uuids, newValues);
    },
    onSetLabelCategory(dataObject: IDataObject, category: ILabelCategory): void {
      const { uuid } = dataObject;
      const newValue: Partial<ILabel> = { category };
      this.$emit('user-edit-label', uuid, newValue);
    },
    onSetLabelMultiCategory(dataObject: IDataObject, multiCategory: ILabelMultiCategory): void {
      const { uuid } = dataObject;
      const newValue: Partial<ILabel> = { multiCategory };
      this.$emit('user-edit-label', uuid, newValue);
    },
    onSetLabelText(dataObject: IDataObject, text: ILabelText): void {
      const { uuid } = dataObject;
      const newValue: Partial<ILabel> = { text };
      this.$emit('user-edit-label', uuid, newValue);
    },
    onClickCard(dataObject: IDataObject, e: MouseEvent): void {
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
    onWindowMinimize(): void {
      const newValue: Partial<TaskWindow> = { isMinimized: true };
      this.$emit('edit-task-window', newValue);
    },
    onWindowPin(): void {
      const newValue: Partial<TaskWindow> = { isPinned: true };
      this.$emit('edit-task-window', newValue);
    },
  },
});
</script>

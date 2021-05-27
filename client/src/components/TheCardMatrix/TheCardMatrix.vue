<template>
  <v-card>
    <TheCardMatrixHeader
      :classes="classes"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      :label-tasks="labelTasks"
      @click:batch-label="onClickBatchLabel"
      @window:minimize="onWindowMinimize"
      @window:pin="onWindowPin"
    />
    <v-divider />
    <div style="height: calc(100% - 30px); display: flex; align-items: center;">
      <VCardMatrix
        v-if="dataObjects.length !== 0"
        style="height: 100%; width: 100%;"
        :data-type="dataType"
        :data-objects="dataObjects"
        :labels="labelCategories"
        :statuses="statuses"
        :classes="classes"
        :selected-uuids="selectedUuids"
        :items-per-row="itemsPerRow"
        :items-per-col="itemsPerCol"
        :label2color="label2color"
        @click:card="onClickCard"
        @click:card-label="onClickCardLabel"
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
  ILabelCategory,
  ILabel,
  LabelTaskType,
  StatusType,
  TaskWindow,
  Category,
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
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    dataType: {
      type: String as PropType<DataType>,
      required: true,
    },
    classes: {
      type: Array as PropType<Category[]>,
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
    labelCategories(): (Category | undefined)[] {
      return this.labels.map((d) => d.category);
    },
    itemsPerRow(): number {
      return this.taskWindow.process.params?.nRows.value as number;
    },
    itemsPerCol(): number {
      return this.taskWindow.process.params?.nColumns.value as number;
    },
  },
  methods: {
    onClickBatchLabel(category: ILabelCategory): void {
      const { selectedUuids, dataObjects } = this;
      // If multi-selection is applied, set the labels for the selected objects.
      const uuids = selectedUuids.length !== 0
        ? selectedUuids
        : dataObjects.map((d) => d.uuid);
      const newValues: Partial<ILabel>[] = new Array(uuids.length)
        .fill(null).map(() => ({ category }));
      this.$emit('user-edit-labels', uuids, newValues);
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
    onClickCardLabel(dataObject: IDataObject, category: ILabelCategory): void {
      const { uuid } = dataObject;
      const newValue: Partial<ILabel> = { category };
      this.$emit('user-edit-label', uuid, newValue);
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

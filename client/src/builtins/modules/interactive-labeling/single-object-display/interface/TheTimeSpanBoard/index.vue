<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    :style="styleCardElevated"
    style="display: flex; flex-direction: column"
  >
    <TheHeader
      :data-type="dataType"
      :label-tasks="labelTasks"
      :category-tasks="categoryTasks"
      :label2color="label2color"
      :label="label"
      @upsert:labels="onUpsertLabels"
      @window:minimize="$emit('update:task-window', { isMinimized: true })"
      @window:pin="$emit('update:task-window', { isPinned: true })"
    />
    <v-divider />
    <div
      v-if="showDataObject"
      style="flex: 1 1 auto; display: flex; flex-direction: column"
    >
      <!-- Note: not setting height: 0px will make the component not responsive
        when the window height is small. -->
      <div style="flex: 1 1 auto; display: flex; gap: 4px; padding: 4px">
        <TheBody
          ref="canvas"
          :data-type="dataType"
          :label-tasks="labelTasks"
          :data-object="dataObject"
          :label="label"
          :category-tasks="categoryTasks"
          :selected-slot="selectedSlot"
          :selected-span="selectedSpan"
          :label2color="label2color"
          style="flex: 1 1 75%"
          @create:span="onCreateLabelSpan"
          @select:span="selectedSpan = $event"
          @select:slot="selectedSlot = $event"
          @update:span="onUpdateLabelSpan"
        />
        <component
          :is="setup.panel"
          v-for="(setup, i) in taskSetups"
          :key="i"
          :label-tasks="labelTasks"
          :label="label"
          :categories="filterCategoriesByLabelTask(setup.type)"
          :label2color="label2color"
          :disabled="label === null"
          style="flex: 1 1 25%"
          @upsert:labels="onUpsertLabels"
        />
      </div>
      <template v-if="enablePagination">
        <v-divider />
        <v-pagination
          v-model="page"
          :length="nPages"
          :total-visible="Math.min(5, nPages)"
        />
      </template>
    </div>
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
import type {
  Category,
  DataType,
  IDataObject,
  ILabel,
  ILabelTimeSpan,
  LabelTaskType,
  TaskWindow,
  ILabelTaskTypeSetup,
} from '@/commons/types';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';
import { cardElevated as styleCardElevated } from '@/style';
import TheHeader from './TheHeader.vue';
import TheBody from './TheBody.vue';

export default defineComponent({
  name: 'TheTimeSpanBoard',
  components: { TheHeader, TheBody },
  props: {
    dataType: {
      type: String as PropType<DataType>,
      // In case the interface is created before data type is selected.
      default: null,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    dataObjects: {
      type: Array as PropType<IDataObject[]>,
      required: true,
    },
    labels: {
      type: Array as PropType<ILabel[]>,
      required: true,
    },
    taskWindow: {
      type: Object as PropType<TaskWindow>,
      required: true,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
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
  },
  data() {
    return {
      styleCardElevated,
      selectedSlot: null as Category | null,
      selectedSpan: null as ILabelTimeSpan | null,
      page: 1 as number,
    };
  },
  computed: {
    taskSetups(): ILabelTaskTypeSetup[] {
      const { labelTasks } = this;
      return labelTaskTypeSetups
        .filter((d) => (labelTasks as string[]).includes(d.type))
        .filter((d) => d.panel !== undefined);
    },
    showDataObject(): boolean {
      const { dataObjects } = this;
      return dataObjects !== null && dataObjects.length !== 0;
    },
    dataObject(): IDataObject | null {
      if (!this.showDataObject) return null;
      return this.dataObjects[this.page - 1];
    },
    label(): ILabel | null {
      if (!this.showDataObject) return null;
      if (this.labels === null) return null;
      return this.labels[this.page - 1];
    },
    labelSpans(): ILabelTimeSpan[] | null {
      return this.label?.spans ?? null;
    },
    enablePagination(): boolean {
      if (!this.showDataObject) return false;
      return this.dataObjects.length >= 2;
    },
    nPages(): number {
      if (!this.showDataObject) return 0;
      return this.dataObjects.length;
    },
  },
  watch: {
    dataObjects() {
      // reset page number
      this.page = 1;
    },
    dataObject() {
      this.selectedSpan = null;
    },
  },
  created(): void {
    // Bind keyboard events.
    window.addEventListener('keydown', this.onKey);
  },
  beforeDestroy(): void {
    // Remove listener before destroy,
    // otherwise the onKey method will be called multiple times.
    window.removeEventListener('keydown', this.onKey);
  },
  mounted() {
    this.page = 1;
  },
  methods: {
    onKey(e: KeyboardEvent): void {
      const { key } = e;

      // Delete the selected span annotation.
      if (key === 'Delete') {
        const { selectedSpan } = this;
        if (selectedSpan === null) return;
        this.onRemoveLabelSpan(selectedSpan);
      }
    },
    onCreateLabelSpan(labelSpan: ILabelTimeSpan): void {
      const { dataObject, labelSpans } = this;
      if (dataObject === null) return;
      const spans = [...(labelSpans ?? []), labelSpan];
      this.$emit('upsert:labels', { uuid: dataObject.uuid, spans });
    },
    onUpdateLabelSpan(newValue: ILabelTimeSpan): void {
      const { dataObject, labelSpans } = this;
      if (dataObject === null || labelSpans === null) return;
      const index = labelSpans.findIndex((d) => d.uuid === newValue.uuid);
      if (!(index >= 0)) return;
      const spans = [...labelSpans];
      spans[index] = newValue;
      this.$emit('upsert:labels', { uuid: dataObject.uuid, spans });
    },
    onRemoveLabelSpan(labelSpan: ILabelTimeSpan): void {
      const {
        dataObject,
        labelSpans,
        selectedSpan,
      } = this;
      if (dataObject === null || labelSpans === null) return;
      if (selectedSpan !== null && selectedSpan.uuid === labelSpan.uuid) {
        this.selectedSpan = null;
      }
      const spans = labelSpans.filter((d) => d.uuid !== labelSpan.uuid);
      this.$emit('upsert:labels', { uuid: dataObject.uuid, spans });
    },
    onUpsertLabels(partialLabel: Partial<ILabel>): void {
      const { dataObject } = this;
      if (dataObject === null) return;
      const { uuid } = dataObject;
      this.$emit('upsert:labels', { uuid, ...partialLabel });
    },
    filterCategoriesByLabelTask(labelTask: LabelTaskType): Category[] {
      return Object.entries(this.categoryTasks)
        .filter(([, usedInTasks]) => (
          usedInTasks === null || usedInTasks.includes(labelTask)
        )).map((d) => d[0]);
    },
  },
});
</script>

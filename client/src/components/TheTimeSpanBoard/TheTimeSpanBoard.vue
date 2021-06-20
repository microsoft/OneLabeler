<template>
  <v-card style="display: flex; flex-direction: column">
    <TheTimeSpanBoardHeader
      :label-tasks="labelTasks"
      :classes="classes"
      :label2color="label2color"
      :label="label"
      @set:label-category="onSetLabelCategory"
      @set:label-text="onSetLabelText"
      @window:minimize="onWindowMinimize"
      @window:pin="onWindowPin"
    />
    <v-divider />
    <div style="flex: 1 1 auto; display: flex; flex-direction: column">
      <template v-if="showDataObject">
        <div style="height: 0px; flex: 1 1 auto; display: flex">
          <TheTimeSpanBoardBody
            ref="canvas"
            :data-type="dataType"
            :data-object="dataObject"
            :label="label"
            :classes="classes"
            :selected-slot="selectedSlot"
            :selected-span="selectedSpan"
            :label2color="label2color"
            @create:span="onCreateLabelSpan"
            @select:span="onSelectLabelSpan"
            @select:slot="onSelectSlot"
            @update:span="onUpdateLabelSpan"
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
      </template>
      <p
        v-else
        class="ma-auto subtitle-1"
      >
        No Data Objects Queried
      </p>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  DataType,
  IDataObject,
  ILabel,
  LabelTaskType,
  TaskWindow,
  ILabelTimeSpan,
  ILabelCategory,
  ILabelText,
} from '@/commons/types';
import TheTimeSpanBoardHeader from './TheTimeSpanBoardHeader.vue';
import TheTimeSpanBoardBody from './TheTimeSpanBoardBody.vue';

export default Vue.extend({
  name: 'TheTimeSpanBoard',
  components: {
    TheTimeSpanBoardHeader,
    TheTimeSpanBoardBody,
  },
  props: {
    dataType: {
      type: String as PropType<DataType>,
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
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    classes: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
  },
  data() {
    return {
      selectedSlot: null as Category | null,
      selectedSpan: null as ILabelTimeSpan | null,
      page: 1 as number,
    };
  },
  computed: {
    showDataObject() {
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
      const { label } = this;
      if (label === null) return null;
      if (label.spans === null || label.spans === undefined) return null;
      return label.spans;
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
    // Remove listener before distroy,
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
      const spans = labelSpans === null ? [labelSpan] : [...labelSpans, labelSpan];
      this.$emit('user-edit-label', dataObject.uuid, { spans } as Partial<ILabel>);
    },
    onSelectLabelSpan(labelSpan: ILabelTimeSpan | null) {
      this.selectedSpan = labelSpan;
    },
    onSelectSlot(category: Category | null): void {
      this.selectedSlot = category;
    },
    onUpdateLabelSpan(newValue: ILabelTimeSpan): void {
      const { dataObject, labelSpans } = this;
      if (dataObject === null || labelSpans === null) return;
      const index = labelSpans.findIndex((d) => d.uuid === newValue.uuid);
      if (!(index >= 0)) return;
      const spans = [...labelSpans];
      spans[index] = newValue;
      this.$emit('user-edit-label', dataObject.uuid, { spans } as Partial<ILabel>);
    },
    onRemoveLabelSpan(labelSpan: ILabelTimeSpan) {
      const {
        dataObject,
        labelSpans,
        selectedSpan,
      } = this;
      if (dataObject === null || labelSpans === null) return;
      if (selectedSpan !== null && selectedSpan.uuid === labelSpan.uuid) {
        this.selectedSpan = null;
      }
      const index = labelSpans.findIndex(
        (d: ILabelTimeSpan) => d.uuid === labelSpan.uuid,
      );
      const spans = [
        ...labelSpans.slice(0, index),
        ...labelSpans.slice(index + 1),
      ];
      this.$emit('user-edit-label', dataObject.uuid, { spans } as Partial<ILabel>);
    },
    onSetLabelCategory(category: ILabelCategory): void {
      const { dataObject } = this;
      if (dataObject === null) return;
      const { uuid } = dataObject;
      const newValue: Partial<ILabel> = { category };
      this.$emit('user-edit-label', uuid, newValue);
    },
    onSetLabelText(text: ILabelText): void {
      const { dataObject } = this;
      if (dataObject === null) return;
      const { uuid } = dataObject;
      const newValue: Partial<ILabel> = { text };
      this.$emit('user-edit-label', uuid, newValue);
    },
    onWindowMinimize() {
      const newValue: Partial<TaskWindow> = { isMinimized: true };
      this.$emit('edit-task-window', newValue);
    },
    onWindowPin() {
      const newValue: Partial<TaskWindow> = { isPinned: true };
      this.$emit('edit-task-window', newValue);
    },
  },
});
</script>

<template>
  <v-card style="display: flex; flex-direction: column">
    <TheTextSpanBoardHeader
      :label-tasks="labelTasks"
      :classes="classes"
      :brush-category="brushCategory"
      :label2color="label2color"
      :label="label"
      @set:label-category="onSetLabelCategory"
      @set:label-text="onSetLabelText"
      @set:brush-category="onSetBrushCategory"
      @window:minimize="onWindowMinimize"
      @window:pin="onWindowPin"
    />
    <v-divider />
    <div style="flex: 1 1 auto; display: flex; flex-direction: column">
      <template v-if="showCanvas">
        <div style="height: 0px; flex: 1 1 auto; display: flex">
          <TheTextSpanBoardBody
            ref="canvas"
            :data-type="dataType"
            :data-object="dataObject"
            :label-spans="labelSpans"
            :brush-category="brushCategory"
            :label2color="label2color"
            @create:span="onCreateLabelSpan"
            @select:span="onSelectLabelSpan"
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
  ILabelSpan,
  ILabelCategory,
  ILabelText,
} from '@/commons/types';
import TheTextSpanBoardHeader from './TheTextSpanBoardHeader.vue';
import TheTextSpanBoardBody from './TheTextSpanBoardBody.vue';

export default Vue.extend({
  name: 'TheTextSpanBoard',
  components: {
    TheTextSpanBoardHeader,
    TheTextSpanBoardBody,
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
  data(): {
    brushCategory: Category | null,
    selectedLabelSpan: ILabelSpan | null,
    page: number,
    } {
    return {
      brushCategory: null,
      selectedLabelSpan: null,
      page: 1,
    };
  },
  computed: {
    showCanvas() {
      const { dataObjects } = this;
      return dataObjects !== null && dataObjects.length !== 0;
    },
    dataObject(): IDataObject | null {
      if (!this.showCanvas) return null;
      return this.dataObjects[this.page - 1];
    },
    label(): ILabel | null {
      if (!this.showCanvas) return null;
      if (this.labels === null) return null;
      return this.labels[this.page - 1];
    },
    labelSpans(): ILabelSpan[] | null {
      const { label } = this;
      if (label === null) return null;
      if (label.spans === null || label.spans === undefined) return null;
      return label.spans;
    },
    enablePagination(): boolean {
      if (!this.showCanvas) return false;
      return this.dataObjects.length >= 2;
    },
    nPages(): number {
      if (!this.showCanvas) return 0;
      return this.dataObjects.length;
    },
  },
  watch: {
    dataObjects() {
      // reset page number
      this.page = 1;
    },
    dataObject() {
      this.brushCategory = null;
      this.selectedLabelSpan = null;
    },
    classes() {
      this.initializeBrushCategory();
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
    this.initializeBrushCategory();
  },
  methods: {
    initializeBrushCategory() {
      if (this.brushCategory === null && this.classes.length !== 0) {
        [this.brushCategory] = this.classes;
      }
    },
    onKey(e: KeyboardEvent): void {
      const { key } = e;

      // Delete tehe selected span annotation.
      if (key === 'Delete') {
        const { selectedLabelSpan } = this;
        if (selectedLabelSpan === null) return;
        this.onRemoveLabelSpan(selectedLabelSpan);
      }
    },
    onCreateLabelSpan(labelSpan: ILabelSpan) {
      const { dataObject, labelSpans } = this;
      if (dataObject === null) return;
      const spans = labelSpans === null ? [labelSpan] : [...labelSpans, labelSpan];
      this.$emit('user-edit-label', dataObject.uuid, { spans } as Partial<ILabel>);
    },
    onSelectLabelSpan(labelSpan: ILabelSpan | null) {
      this.selectedLabelSpan = labelSpan;
      if (labelSpan !== null) {
        this.brushCategory = labelSpan.category;
      }
    },
    onUpdateLabelSpan(labelSpan: ILabelSpan) {
      const { dataObject, labelSpans } = this;
      if (dataObject === null || labelSpans === null) return;
      const index = labelSpans.findIndex(
        (d: ILabelSpan) => d.uuid === labelSpan.uuid,
      );
      const spans = [...labelSpans];
      spans[index] = labelSpan;
      this.$emit('user-edit-label', dataObject.uuid, { spans } as Partial<ILabel>);
    },
    onRemoveLabelSpan(labelSpan: ILabelSpan) {
      const { dataObject, labelSpans } = this;
      if (dataObject === null || labelSpans === null) return;
      const index = labelSpans.findIndex(
        (d: ILabelSpan) => d.uuid === labelSpan.uuid,
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
    onSetBrushCategory(category: Category) {
      this.brushCategory = category;
      const { selectedLabelSpan } = this;
      if (selectedLabelSpan === null) return;
      this.onUpdateLabelSpan({ ...selectedLabelSpan, category });
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

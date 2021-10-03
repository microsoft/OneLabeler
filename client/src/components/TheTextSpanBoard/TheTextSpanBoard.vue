<template>
  <v-card style="display: flex; flex-direction: column">
    <TheTextSpanBoardHeader
      :data-type="dataType"
      :label-tasks="labelTasks"
      :data-object="dataObject"
      :label="label"
      :brush-category="brushCategory"
      :category-tasks="categoryTasks"
      :label2color="label2color"
      @set:brush-category="onSetBrushCategory"
      @upsert:label="onUpsertLabel"
      @window:minimize="$emit('edit-task-window', { isMinimized: true })"
      @window:pin="$emit('edit-task-window', { isPinned: true })"
    />
    <v-divider />
    <div style="flex: 1 1 auto; display: flex; flex-direction: column">
      <template v-if="showDataObject">
        <div style="height: 0px; flex: 1 1 auto; display: flex">
          <TheTextSpanBoardBody
            ref="canvas"
            :data-type="dataType"
            :label-tasks="labelTasks"
            :data-object="dataObject"
            :label="label"
            :brush-category="brushCategory"
            :label2color="label2color"
            @upsert:label="onUpsertLabel"
            @create:span="onCreateLabelSpan"
            @select:span="onSelectLabelSpan"
            @remove:span="onRemoveLabelSpan"
            @create:relation="onCreateLabelRelation"
            @remove:relation="onRemoveLabelRelation"
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
  ILabelRelation,
  ILabelTextSpan,
  LabelTaskType,
  TaskWindow,
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
    classes: {
      type: Array as PropType<Category[]>,
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
  data() {
    return {
      brushCategory: null as Category | null,
      selectedSpan: null as ILabelTextSpan | null,
      page: 1 as number,
    };
  },
  computed: {
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
    labelSpans(): ILabelTextSpan[] | null {
      return this.label?.spans ?? null;
    },
    labelRelations(): ILabelRelation[] | null {
      return this.label?.relations ?? null;
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
      this.brushCategory = null;
      this.selectedSpan = null;
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
    initializeBrushCategory(): void {
      if (this.brushCategory === null && this.classes.length !== 0) {
        [this.brushCategory] = this.classes;
      }
    },
    onKey(e: KeyboardEvent): void {
      const { key } = e;

      // Delete the selected span annotation.
      if (key === 'Delete') {
        const { selectedSpan } = this;
        if (selectedSpan === null) return;
        this.onRemoveLabelSpan(selectedSpan);
      }
    },
    onCreateLabelRelation(relation: ILabelRelation): void {
      const { dataObject, labelRelations } = this;
      if (dataObject === null) return;
      const relations = labelRelations === null
        ? [relation]
        : [...labelRelations, relation];
      this.$emit('user-edit-label', dataObject.uuid, { relations } as Partial<ILabel>);
    },
    onRemoveLabelRelation(relation: ILabelRelation): void {
      const { dataObject, labelRelations } = this;
      if (dataObject === null || labelRelations === null) return;
      const relations = labelRelations.filter((d) => d.uuid !== relation.uuid);
      this.$emit('user-edit-label', dataObject.uuid, { relations } as Partial<ILabel>);
    },
    onCreateLabelSpan(span: ILabelTextSpan): void {
      const { dataObject, labelSpans } = this;
      if (dataObject === null) return;
      const spans = labelSpans === null ? [span] : [...labelSpans, span];
      this.$emit('user-edit-label', dataObject.uuid, { spans } as Partial<ILabel>);
    },
    onSelectLabelSpan(span: ILabelTextSpan | null): void {
      this.selectedSpan = span;
      if (span !== null) {
        this.brushCategory = span.category;
      }
    },
    onUpdateLabelSpan(span: ILabelTextSpan): void {
      const { dataObject, labelSpans } = this;
      if (dataObject === null || labelSpans === null) return;
      const index = labelSpans.findIndex(
        (d: ILabelTextSpan) => d.uuid === span.uuid,
      );
      const spans = [...labelSpans];
      spans[index] = span;
      this.$emit('user-edit-label', dataObject.uuid, { spans } as Partial<ILabel>);
    },
    onRemoveLabelSpan(span: ILabelTextSpan): void {
      const {
        dataObject,
        labelSpans,
        labelRelations,
      } = this;
      if (dataObject === null || labelSpans === null) return;

      // Remove the relations that involves the label span.
      const relations = labelRelations === null
        ? null
        : labelRelations.filter((d) => (
          d.sourceUuid !== span.uuid && d.targetUuid !== span.uuid
        ));

      // Remove the label span itself.
      const spans = labelSpans.filter((d) => d.uuid !== span.uuid);

      this.$emit('user-edit-label', dataObject.uuid, { relations, spans } as Partial<ILabel>);
    },
    onUpsertLabel(partialLabel: Partial<ILabel>): void {
      const { dataObject } = this;
      if (dataObject === null) return;
      const { uuid } = dataObject;
      this.$emit('user-edit-label', uuid, partialLabel);
    },
    onSetBrushCategory(category: Category | null): void {
      this.brushCategory = category;
      const { selectedSpan } = this;
      if (selectedSpan === null || category === null) return;
      this.onUpdateLabelSpan({ ...selectedSpan, category });
    },
  },
});
</script>

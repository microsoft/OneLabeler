<template>
  <v-card style="display: flex; flex-direction: column;">
    <TheHeader
      :data-type="dataType"
      :label-tasks="labelTasks"
      :label="label"
      :category-tasks="categoryTasks"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      :stroke-label="strokeLabel"
      :stroke-shape="strokeShape"
      :stroke-width="strokeWidth"
      :mouse-operation="mouseOperation"
      @reset:image-size="onResetImageSize"
      @set:stroke-label="strokeLabel = $event"
      @set:stroke-shape="strokeShape = $event"
      @set:stroke-width="strokeWidth = $event"
      @set:mouse-operation="mouseOperation = $event"
      @upsert:labels="onUpsertLabels"
      @window:minimize="$emit('update:task-window', { isMinimized: true })"
      @window:pin="$emit('update:task-window', { isPinned: true })"
    />
    <v-divider />
    <div
      v-if="showDataObject"
      style="flex: 1 1 auto; display: flex; flex-direction: column; align-items: center;"
    >
      <TheBody
        ref="canvas"
        :data-object="dataObject"
        :label-shapes="labelShapes"
        :label-mask="labelMask"
        :unlabeled-mark="unlabeledMark"
        :stroke-shape="strokeShape"
        :stroke-width="strokeWidth"
        :stroke-label="strokeLabel"
        :label2color="label2color"
        :mouse-operation="mouseOperation"
        style="flex: 1 1 auto; width: 100%;"
        @create:shape="onAddLabelShape"
        @update:shape="onUpdateLabelShape"
        @delete:shape="onRemoveLabelShape"
        @update:mask="onSetLabelMask"
      />
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
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType, ComponentInstance } from '@vue/composition-api';
import { canvasToFile, getBase64 } from '@/plugins/file';
import type {
  Category,
  DataType,
  IDataObject,
  ILabel,
  ILabelShape,
  ILabelMask,
  LabelTaskType,
  LabelUpsertQuery,
  TaskWindow,
} from '@/commons/types';
import { MouseOperationType, StrokeShapeType } from './types';
import TheHeader from './TheHeader.vue';
import TheBody from './TheBody.vue';

export default defineComponent({
  name: 'ThePaintBoard',
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
  },
  data() {
    return {
      strokeLabel: null as Category | null,
      strokeShape: StrokeShapeType.Square,
      strokeWidth: 1,
      mouseOperation: MouseOperationType.PanAndZoom,
      page: 1,
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
    labelShapes(): ILabelShape[] | null {
      return this.label?.shapes ?? null;
    },
    labelMask(): ILabelMask | null {
      return this.label?.mask ?? null;
    },
    enablePagination(): boolean {
      if (!this.showDataObject) return false;
      return this.dataObjects.length >= 2;
    },
    nPages(): number {
      if (!this.showDataObject) return 0;
      return this.dataObjects.length;
    },
    categories(): Category[] {
      const { categoryTasks } = this;
      return Object.keys(categoryTasks)
        .filter((d) => d !== null && d !== undefined);
    },
  },
  watch: {
    dataObjects() {
      // reset page number
      this.page = 1;
    },
    categories() {
      this.initializeStrokeLabel();
    },
  },
  mounted() {
    this.page = 1;
    this.initializeStrokeLabel();
  },
  methods: {
    initializeStrokeLabel(): void {
      if (this.strokeLabel === null && this.categories.length !== 0) {
        [this.strokeLabel] = this.categories;
      }
    },
    async onSetLabelMask(labelMaskCanvas: HTMLCanvasElement): Promise<void> {
      const { dataObject } = this;
      if (dataObject === null) return;
      const file = await canvasToFile(labelMaskCanvas, `${dataObject.uuid}-mask.png`);
      const newValue: LabelUpsertQuery = {
        uuid: dataObject.uuid,
        mask: { content: (await getBase64(file)) } as ILabelMask,
      };
      this.$emit('upsert:labels', newValue);
    },
    onAddLabelShape(labelShape: ILabelShape): void {
      const { dataObject, labelShapes } = this;
      if (dataObject === null) return;
      const newValue: LabelUpsertQuery = {
        uuid: dataObject.uuid,
        shapes: [...(labelShapes ?? []), labelShape],
      };
      this.$emit('upsert:labels', newValue);
    },
    onUpdateLabelShape(labelShape: ILabelShape): void {
      const { dataObject, labelShapes } = this;
      if (dataObject === null) return;
      let shapes: ILabelShape[];
      if (labelShapes === null) {
        shapes = [labelShape];
      } else {
        const index = labelShapes.findIndex(
          (d: ILabelShape) => d.uuid === labelShape.uuid,
        );
        shapes = [...labelShapes];
        shapes[index] = labelShape;
      }
      this.$emit('upsert:labels', { uuid: dataObject.uuid, shapes });
    },
    onRemoveLabelShape(labelShape: ILabelShape): void {
      const { dataObject, labelShapes } = this;
      if (dataObject === null) return;
      const shapes: ILabelShape[] = labelShapes === null
        ? [labelShape]
        : labelShapes.filter((d) => d.uuid !== labelShape.uuid);
      this.$emit('upsert:labels', { uuid: dataObject.uuid, shapes });
    },
    onUpsertLabels(partialLabel: Partial<ILabel>): void {
      const { dataObject } = this;
      if (dataObject === null) return;
      this.$emit('upsert:labels', { uuid: dataObject.uuid, ...partialLabel });
    },
    onResetImageSize(): void {
      (this.$refs.canvas as ComponentInstance & { resetStageZoom: () => void }).resetStageZoom();
    },
  },
});
</script>

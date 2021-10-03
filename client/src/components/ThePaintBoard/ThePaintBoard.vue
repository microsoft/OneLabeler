<template>
  <v-card style="display: flex; flex-direction: column;">
    <ThePaintBoardHeader
      :data-type="dataType"
      :label-tasks="labelTasks"
      :classes="classes"
      :category-tasks="categoryTasks"
      :stroke-label="strokeLabel"
      :stroke-shape="strokeShape"
      :stroke-width="strokeWidth"
      :mouse-operation="mouseOperation"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      :label="label"
      @reset:image-size="onResetImageSize"
      @set:stroke-label="strokeLabel = $event"
      @set:stroke-shape="strokeShape = $event"
      @set:stroke-width="strokeWidth = $event"
      @set:mouse-operation="mouseOperation = $event"
      @upsert:label="onUpsertLabel"
      @window:minimize="$emit('edit-task-window', { isMinimized: true })"
      @window:pin="$emit('edit-task-window', { isPinned: true })"
    />
    <v-divider />
    <div style="flex: 1 1 auto; display: flex; flex-direction: column; align-items: center;">
      <template v-if="showCanvas">
        <ThePaintBoardCanvas
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
      </template>
      <p
        v-else
        class="subtitle-1"
        style="flex: 1 1 auto; display: flex; align-items: center;"
      >
        No Data Objects Queried
      </p>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { getBase64 } from '@/plugins/file';
import {
  Category,
  DataType,
  IDataObject,
  ILabel,
  ILabelShape,
  ILabelMask,
  LabelTaskType,
  TaskWindow,
} from '@/commons/types';
import { MouseOperationType, StrokeShapeType } from './types';
import ThePaintBoardHeader from './ThePaintBoardHeader.vue';
import ThePaintBoardCanvas from './ThePaintBoardCanvas.vue';

const canvasToFile = async (
  canvas: HTMLCanvasElement,
  filename: string,
): Promise<File> => new Promise((resolve) => {
  canvas.toBlob(async (blob: Blob | null) => {
    if (blob === null) return;
    const file = new File(
      [blob],
      filename,
      { type: blob.type },
    );
    resolve(file);
  });
});

export default Vue.extend({
  name: 'ThePaintBoard',
  components: {
    ThePaintBoardHeader,
    ThePaintBoardCanvas,
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
      strokeLabel: null as Category | null,
      strokeShape: StrokeShapeType.Square,
      strokeWidth: 1,
      mouseOperation: MouseOperationType.PanAndZoom,
      page: 1,
    };
  },
  computed: {
    showCanvas(): boolean {
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
    labelShapes(): ILabelShape[] | null {
      return this.label?.shapes ?? null;
    },
    labelMask(): ILabelMask | null {
      return this.label?.mask ?? null;
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
    classes() {
      this.initializeStrokeLabel();
    },
  },
  mounted() {
    this.page = 1;
    this.initializeStrokeLabel();
  },
  methods: {
    initializeStrokeLabel(): void {
      if (this.strokeLabel === null && this.classes.length !== 0) {
        [this.strokeLabel] = this.classes;
      }
    },
    async onSetLabelMask(labelMaskCanvas: HTMLCanvasElement): Promise<void> {
      if (this.dataObject === null) return;
      const { uuid } = this.dataObject;
      const file = await canvasToFile(labelMaskCanvas, `${uuid}-mask.png`);
      const mask: ILabelMask = { content: (await getBase64(file)) };
      const newValue: Partial<ILabel> = { mask };
      this.$emit('user-edit-label', uuid, newValue);
    },
    onAddLabelShape(labelShape: ILabelShape): void {
      const { dataObject, labelShapes } = this;
      if (dataObject === null) return;
      const shapes = labelShapes === null ? [labelShape] : [...labelShapes, labelShape];
      this.$emit('user-edit-label', dataObject.uuid, { shapes } as Partial<ILabel>);
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
      this.$emit('user-edit-label', dataObject.uuid, { shapes } as Partial<ILabel>);
    },
    onRemoveLabelShape(labelShape: ILabelShape): void {
      const { dataObject, labelShapes } = this;
      if (dataObject === null) return;
      const shapes: ILabelShape[] = labelShapes === null
        ? [labelShape]
        : labelShapes.filter((d) => d.uuid !== labelShape.uuid);
      this.$emit('user-edit-label', dataObject.uuid, { shapes } as Partial<ILabel>);
    },
    onUpsertLabel(partialLabel: Partial<ILabel>): void {
      const { dataObject } = this;
      if (dataObject === null) return;
      const { uuid } = dataObject;
      this.$emit('user-edit-label', uuid, partialLabel);
    },
    onResetImageSize(): void {
      (this.$refs.canvas as Vue & { resetStageZoom: () => void }).resetStageZoom();
    },
  },
});
</script>

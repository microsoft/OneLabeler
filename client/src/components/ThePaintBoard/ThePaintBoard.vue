<template>
  <v-card>
    <ThePaintBoardHeader
      :label-tasks="labelTasks"
      :classes="classes"
      :stroke-label="strokeLabel"
      :stroke-shape="strokeShape"
      :stroke-width="strokeWidth"
      :mouse-operation="mouseOperation"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      :label="label"
      @reset:image-size="onResetImageSize"
      @set:stroke-label="onSetStrokeLabel"
      @set:stroke-shape="onSetStrokeShape"
      @set:stroke-width="onSetStrokeWidth"
      @set:mouse-operation="onSetMouseOperation"
      @set:label-category="onSetLabelCategory"
      @set:label-multi-category="onSetLabelMultiCategory"
      @set:label-text="onSetLabelText"
      @window:minimize="onWindowMinimize"
      @window:pin="onWindowPin"
    />
    <v-divider />
    <v-card-actions
      ref="container"
      class="pa-0"
      style="height: calc(100% - 31px)"
    >
      <div
        v-if="showCanvas"
        style="height: 100%; width: 100%;"
      >
        <div :style="`height: ${canvasHeight}px`">
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
            @create:shape="onAddLabelShape"
            @update:shape="onUpdateLabelShape"
            @delete:shape="onRemoveLabelShape"
            @update:mask="onSetLabelMask"
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
      <p
        v-else
        class="mx-auto subtitle-1"
      >
        No Data Objects Queried
      </p>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { getBase64 } from '@/plugins/file';
import {
  Category,
  IDataObject,
  IImage,
  ILabel,
  ILabelCategory,
  ILabelMultiCategory,
  ILabelShape,
  ILabelMask,
  ILabelText,
  LabelTaskType,
  TaskWindow,
} from '@/commons/types';
import { MouseOperationType, StrokeShapeType } from './types';
import ThePaintBoardHeader from './ThePaintBoardHeader.vue';
import ThePaintBoardCanvas from './ThePaintBoardCanvas.vue';

export default Vue.extend({
  name: 'ThePaintBoard',
  components: {
    ThePaintBoardHeader,
    ThePaintBoardCanvas,
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
      paginationHeight: 43.6,
      canvasHeight: 0,
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
      const { label } = this;
      if (label === null) return null;
      if (label.shapes === null || label.shapes === undefined) return null;
      return label.shapes;
    },
    labelMask(): ILabelMask | null {
      const { label } = this;
      if (label === null) return null;
      if (label.mask === null || label.mask === undefined) return null;
      return label.mask;
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
      this.setCanvasHeight();
    },
    classes() {
      this.initializeStrokeLabel();
    },
  },
  mounted() {
    this.page = 1;
    this.setCanvasHeight();
    this.initializeStrokeLabel();
  },
  methods: {
    initializeStrokeLabel(): void {
      if (this.strokeLabel === null && this.classes.length !== 0) {
        [this.strokeLabel] = this.classes;
      }
    },
    onSetLabelMask(labelMaskCanvas: HTMLCanvasElement): void {
      if (this.dataObject === null) return;
      const { uuid } = this.dataObject as IImage;
      const filename = uuid;

      labelMaskCanvas.toBlob(async (blob: Blob | null) => {
        if (blob === null) return;
        const file = new File(
          [blob],
          `${filename}-mask.png`,
          { type: blob.type },
        );
        const mask: ILabelMask = { content: (await getBase64(file)) };
        const newValue: Partial<ILabel> = { mask };
        this.$emit('user-edit-label', uuid, newValue);
      });
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
    onSetLabelCategory(category: ILabelCategory): void {
      const { dataObject } = this;
      if (dataObject === null) return;
      const { uuid } = dataObject;
      const newValue: Partial<ILabel> = { category };
      this.$emit('user-edit-label', uuid, newValue);
    },
    onSetLabelMultiCategory(multiCategory: ILabelMultiCategory): void {
      const { dataObject } = this;
      if (dataObject === null) return;
      const { uuid } = dataObject;
      const newValue: Partial<ILabel> = { multiCategory };
      this.$emit('user-edit-label', uuid, newValue);
    },
    onSetLabelText(text: ILabelText): void {
      const { dataObject } = this;
      if (dataObject === null) return;
      const { uuid } = dataObject;
      const newValue: Partial<ILabel> = { text };
      this.$emit('user-edit-label', uuid, newValue);
    },
    onResetImageSize(): void {
      (this.$refs.canvas as Vue & { resetStageZoom: () => void }).resetStageZoom();
    },
    onSetStrokeLabel(strokeLabel: Category): void {
      this.strokeLabel = strokeLabel;
    },
    onSetStrokeShape(strokeShape: StrokeShapeType): void {
      this.strokeShape = strokeShape;
    },
    onSetStrokeWidth(strokeWidth: number): void {
      this.strokeWidth = strokeWidth;
    },
    onSetMouseOperation(mouseOperation: MouseOperationType): void {
      this.mouseOperation = mouseOperation;
    },
    onWindowMinimize(): void {
      const newValue: Partial<TaskWindow> = { isMinimized: true };
      this.$emit('edit-task-window', newValue);
    },
    onWindowPin(): void {
      const newValue: Partial<TaskWindow> = { isPinned: true };
      this.$emit('edit-task-window', newValue);
    },
    setCanvasHeight(): void {
      // update canvas size according to whether pagination is needed
      if (!this.showCanvas) {
        this.canvasHeight = 0;
      } else if (!this.enablePagination) {
        const containerHeight = (this.$refs.container as HTMLElement).clientHeight;
        this.canvasHeight = containerHeight;
      } else {
        const containerHeight = (this.$refs.container as HTMLElement).clientHeight;
        const { paginationHeight } = this;
        this.canvasHeight = containerHeight - paginationHeight;
      }
    },
  },
});
</script>

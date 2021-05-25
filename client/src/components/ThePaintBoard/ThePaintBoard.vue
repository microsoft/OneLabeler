<template>
  <v-card>
    <ThePaintBoardHeader
      :label-tasks="labelTasks"
      :stroke-label="strokeLabel"
      :stroke-shape="strokeShape"
      :stroke-width="strokeWidth"
      :mouse-operation="mouseOperation"
      :classes="classes"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      @reset:image-size="onResetImageSize"
      @set:stroke-label="onSetStrokeLabel"
      @set:stroke-shape="onSetStrokeShape"
      @set:stroke-width="onSetStrokeWidth"
      @set:mouse-operation="onSetMouseOperation"
      @window:minimize="onWindowMinimize"
      @window:pin="onWindowPin"
    />
    <v-divider />
    <v-card-actions
      ref="container"
      class="pa-0"
      style="height: calc(100% - 31px)"
    >
      <v-container
        v-if="showCanvas"
        class="pa-0 ma-0"
        style="height: 100%"
        fluid
      >
        <v-row
          :style="`height: ${canvasHeight}px`"
          class="pa-0"
          no-gutters
        >
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
            @update:label-shape="onUpdateLabelShape"
            @delete:shape="onRemoveLabelShape"
            @update:label-mask="onSetLabelMask"
          />
        </v-row>
        <template v-if="enablePagination">
          <v-divider />
          <v-row
            class="pa-0"
            no-gutters
          >
            <div
              ref="pagination"
              class="text-center"
              style="width: 100%"
            >
              <v-pagination
                v-model="page"
                :length="nPages"
                :total-visible="Math.min(5, nPages)"
              />
            </div>
          </v-row>
        </template>
      </v-container>
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
import uploadFile from '@/services/upload-file';
import {
  Category,
  IDataObject,
  IImage,
  ILabel,
  ILabelShape,
  ILabelMask,
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
  data(): {
    strokeLabel: Category | null,
    strokeShape: StrokeShapeType,
    strokeWidth: number,
    paginationHeight: number,
    canvasHeight: number,
    mouseOperation: MouseOperationType,
    page: number,
    } {
    return {
      strokeLabel: null,
      strokeShape: StrokeShapeType.Square,
      strokeWidth: 1,
      paginationHeight: 43.6,
      canvasHeight: 0,
      mouseOperation: MouseOperationType.PanAndZoom,
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
    initializeStrokeLabel() {
      if (this.strokeLabel === null && this.classes.length !== 0) {
        [this.strokeLabel] = this.classes;
      }
    },
    onSetLabelMask(labelMaskCanvas: HTMLCanvasElement) {
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
        const mask = { path: (await uploadFile(file)).data.path };
        const newValue: Partial<ILabel> = { mask };
        this.$emit('user-edit-label', uuid, newValue);
      });
    },
    onAddLabelShape(labelShape: ILabelShape) {
      const { dataObject, labelShapes } = this;
      if (dataObject === null) return;
      const shapes = labelShapes === null ? [labelShape] : [...labelShapes, labelShape];
      this.$emit('user-edit-label', dataObject.uuid, { shapes } as Partial<ILabel>);
    },
    onUpdateLabelShape(labelShape: ILabelShape) {
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
    onRemoveLabelShape(labelShape: ILabelShape) {
      const { dataObject, labelShapes } = this;
      if (dataObject === null) return;
      let shapes: ILabelShape[];
      if (labelShapes === null) {
        shapes = [labelShape];
      } else {
        const index = labelShapes.findIndex(
          (d: ILabelShape) => d.uuid === labelShape.uuid,
        );
        shapes = [
          ...labelShapes.slice(0, index),
          ...labelShapes.slice(index + 1),
        ];
      }
      this.$emit('user-edit-label', dataObject.uuid, { shapes } as Partial<ILabel>);
    },
    onResetImageSize() {
      (this.$refs.canvas as Vue & { resetZoom: () => void }).resetZoom();
    },
    onSetStrokeLabel(strokeLabel: Category) {
      this.strokeLabel = strokeLabel;
    },
    onSetStrokeShape(strokeShape: StrokeShapeType) {
      this.strokeShape = strokeShape;
    },
    onSetStrokeWidth(strokeWidth: number) {
      this.strokeWidth = strokeWidth;
    },
    onSetMouseOperation(mouseOperation: MouseOperationType) {
      this.mouseOperation = mouseOperation;
    },
    onWindowMinimize() {
      const newValue: Partial<TaskWindow> = { isMinimized: true };
      this.$emit('edit-task-window', newValue);
    },
    onWindowPin() {
      const newValue: Partial<TaskWindow> = { isPinned: true };
      this.$emit('edit-task-window', newValue);
    },
    setCanvasHeight() {
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

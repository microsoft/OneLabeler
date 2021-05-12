<template>
  <v-card>
    <ThePaintViewHeader
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
          <ThePaintViewCanvas
            ref="canvas"
            :data-object="dataObject"
            :label-geometric-objects="labelGeometricObjects"
            :label-mask="labelMask"
            :unlabeled-mark="unlabeledMark"
            :stroke-shape="strokeShape"
            :stroke-width="strokeWidth"
            :stroke-label="strokeLabel"
            :label2color="label2color"
            :mouse-operation="mouseOperation"
            @create:shape="onAddLabelGeometricObject"
            @update:label-shape="onUpdateLabelGeometricObject"
            @delete:shape="onRemoveLabelGeometricObject"
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
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import uploadFile from '@/services/upload-file';
import {
  IDataObject,
  IImage,
  ILabelGeometricObject,
  ILabelMask,
  Label,
  Status,
} from '@/commons/types';
import { MouseOperationType, StrokeShapeType } from './types';
import ThePaintViewHeader from './ThePaintViewHeader.vue';
import ThePaintViewCanvas from './ThePaintViewCanvas.vue';

export default Vue.extend({
  name: 'ThePaintView',
  components: {
    ThePaintViewHeader,
    ThePaintViewCanvas,
  },
  data(): {
    strokeLabel: Label | null,
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
    ...mapState(['classes', 'unlabeledMark']),
    ...mapGetters([
      'sampledDataObjects',
      'sampledDataObjectLabelGeometricObjects',
      'sampledDataObjectLabelMasks',
      'label2color',
    ]),
    ...mapGetters('workflow', ['labelTasks']),
    showCanvas() {
      const { sampledDataObjects } = this;
      return sampledDataObjects !== null && sampledDataObjects.length !== 0;
    },
    dataObject(): IDataObject | null {
      if (!this.showCanvas) return null;
      return this.sampledDataObjects[this.page - 1];
    },
    labelGeometricObjects(): ILabelGeometricObject[] | null {
      if (!this.showCanvas) return null;
      return this.sampledDataObjectLabelGeometricObjects[this.page - 1];
    },
    labelMask(): ILabelMask | null {
      if (!this.showCanvas) return null;
      return this.sampledDataObjectLabelMasks[this.page - 1];
    },
    enablePagination(): boolean {
      if (!this.showCanvas) return false;
      return this.sampledDataObjects.length >= 2;
    },
    nPages(): number {
      if (!this.showCanvas) return 0;
      return this.sampledDataObjects.length;
    },
  },
  watch: {
    sampledDataObjects() {
      // reset page number
      this.page = 1;
      this.setCanvasHeight();
    },
    classes() {
      this.initializeStrokeLabel();
    },
  },
  mounted() {
    this.initializeStrokeLabel();
  },
  methods: {
    ...mapActions([
      'setDataObjectLabelGeometricObjects',
      'setDataObjectLabelMask',
      'setStatusOf',
    ]),
    initializeStrokeLabel() {
      if (this.strokeLabel === null && this.classes.length !== 0) {
        [this.strokeLabel] = this.classes;
      }
    },
    onSetLabelMask(labelMaskCanvas: HTMLCanvasElement) {
      if (this.dataObject === null) return;
      const { path, uuid } = this.dataObject as IImage;
      if (path === null) return;
      const pathSegments = path.split('/');
      const filename = pathSegments[pathSegments.length - 1]
        .split('.')[0];

      labelMaskCanvas.toBlob(async (blob: Blob | null) => {
        if (blob === null) return;
        const file = new File(
          [blob],
          `${filename}-mask.png`,
          { type: blob.type },
        );
        const labelMaskPath = (await uploadFile(file)).data.path;
        const labelMask = {
          path: labelMaskPath,
        };
        this.setDataObjectLabelMask({
          uuid,
          labelMask,
          inQueryIndices: true,
        });
        this.setStatusOf({
          uuid,
          status: Status.Labeled,
          inQueryIndices: true,
        });
      });
    },
    onAddLabelGeometricObject(labelGeometricObject: ILabelGeometricObject) {
      const { dataObject, labelGeometricObjects } = this;
      if (dataObject === null) return;
      const { uuid } = dataObject as IDataObject;
      this.setDataObjectLabelGeometricObjects({
        uuid,
        labelGeometricObjects: [...labelGeometricObjects, labelGeometricObject],
        inQueryIndices: true,
      });
      this.setStatusOf({
        uuid,
        status: Status.Labeled,
        inQueryIndices: true,
      });
    },
    onUpdateLabelGeometricObject(labelGeometricObject: ILabelGeometricObject) {
      const { dataObject, labelGeometricObjects } = this;
      const index = labelGeometricObjects.findIndex(
        (d: ILabelGeometricObject) => d.uuid === labelGeometricObject.uuid,
      );
      const updatedLabelGeometricObjects = [
        ...labelGeometricObjects.slice(0, index),
        labelGeometricObject,
        ...labelGeometricObjects.slice(index + 1),
      ];
      const { uuid } = dataObject as IDataObject;
      this.setDataObjectLabelGeometricObjects({
        uuid,
        labelGeometricObjects: updatedLabelGeometricObjects,
        inQueryIndices: true,
      });
      this.setStatusOf({
        uuid,
        status: Status.Labeled,
        inQueryIndices: true,
      });
    },
    onRemoveLabelGeometricObject(labelGeometricObject: ILabelGeometricObject) {
      const { dataObject, labelGeometricObjects } = this;
      const index = labelGeometricObjects.findIndex(
        (d: ILabelGeometricObject) => d.uuid === labelGeometricObject.uuid,
      );
      const updatedLabelGeometricObjects = [
        ...labelGeometricObjects.slice(0, index),
        ...labelGeometricObjects.slice(index + 1),
      ];
      const { uuid } = dataObject as IDataObject;
      this.setDataObjectLabelGeometricObjects({
        uuid,
        labelGeometricObjects: updatedLabelGeometricObjects,
        inQueryIndices: true,
      });
      this.setStatusOf({
        uuid,
        status: Status.Labeled,
        inQueryIndices: true,
      });
    },
    onResetImageSize() {
      this.$refs.canvas.resetZoom();
    },
    onSetStrokeLabel(strokeLabel: Label) {
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

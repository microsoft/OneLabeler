<template>
  <div
    ref="container"
    style="background-color: #D0DAE8"
    @mouseout="onMouseOutStage"
  >
    <!-- Set position absolute to allow container to have responsive resize
      (when a suitable style is set, e.g., flex layout),
      instead of having to be the same size as the stage. -->
    <v-stage
      ref="stage"
      :config="{ draggable }"
      :style="{ cursor, position: 'absolute' }"
      @dragend="onDragEndStage"
      @wheel="onWheelStage"
      @mousedown="onMouseDownStage"
      @mousemove="onMouseMoveStage"
      @mouseup="onMouseUpStage"
      @click="onClickStage"
    >
      <TheLayerImage
        :src="dataObject.content"
        :blur="blur"
      />
      <TheLayerPaint
        ref="layerPaint"
        :width="imgWidth"
        :height="imgHeight"
        :label-mask="labelMask"
      />
      <TheLayerShapes
        ref="layerShapes"
        :label-shapes="labelShapes"
        :selected-shape-uuids="selectedShapeUuids"
        :label2color="label2color"
        :editable="editable"
        @update:shape="$emit('update:shape', $event)"
        @update:selected-shapes="onUpdateSelectedShapes"
      />
      <v-layer
        ref="layerInteraction"
        :config="{ imageSmoothingEnabled: false }"
        style="image-rendering: pixelated"
      />
    </v-stage>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import simplify from '@/plugins/simplify';
import { ObjectShapeType } from '@/commons/types';
import type {
  Category,
  IImage,
  ILabelMask,
  ILabelShape,
} from '@/commons/types';
import {
  MouseOperationType,
  StrokeShapeType,
  VueKonvaLayer,
} from './types';
import { createCircle } from './pixelated-circle';
import TheLayerImage from './TheLayerImage.vue';
import TheLayerPaint from './TheLayerPaint.vue';
import TheLayerShapes from './TheLayerShapes.vue';

export default Vue.extend({
  name: 'ThePaintBoardBody',
  components: {
    TheLayerImage,
    TheLayerPaint,
    TheLayerShapes,
  },
  props: {
    dataObject: {
      type: Object as PropType<IImage>,
      required: true,
    },
    labelShapes: {
      type: Array as PropType<ILabelShape[] | null>,
      default: null,
    },
    labelMask: {
      type: Object as PropType<ILabelMask | null>,
      default: null,
    },
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    /** @param {Number} strokeLabel currently selected category for stroke */
    strokeLabel: {
      type: String as PropType<Category>,
      default: null,
    },
    /** @param {Number} strokeShape currently selected shape for stroke */
    strokeShape: {
      type: String as PropType<StrokeShapeType>,
      required: true,
    },
    /** @param {Number} strokeWidth currently selected width for stroke */
    strokeWidth: {
      type: Number,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    mouseOperation: {
      type: String as PropType<MouseOperationType>,
      required: true,
    },
  },
  data() {
    return {
      resizeObserver: null as ResizeObserver | null,
      // Whether to snap the canvas to ensure pixel edges align with the canvas edge.
      snapToPixel: true,
      blur: 3,
      isMouseDown: false,
      boundPixelsPerRow: [10, 2000] as [number, number] | null,
      boundPixelsPerColumn: [10, 2000] as [number, number] | null,
      points: [] as [number, number][],
      selectedShapeUuids: [] as string[],
    };
  },
  computed: {
    draggable(): boolean {
      return this.mouseOperation === MouseOperationType.PanAndZoom;
    },
    paintable(): boolean {
      return this.mouseOperation === MouseOperationType.PaintBrush;
    },
    erasable(): boolean {
      return this.mouseOperation === MouseOperationType.PaintErase;
    },
    editable(): boolean {
      return this.mouseOperation === MouseOperationType.EditShape;
    },
    polygonByClick(): boolean {
      return this.mouseOperation === MouseOperationType.ClickCreatePolygon;
    },
    rectByClick(): boolean {
      return this.mouseOperation === MouseOperationType.ClickCreateRect;
    },
    pointByClick(): boolean {
      return this.mouseOperation === MouseOperationType.ClickCreatePoint;
    },
    polygonByLasso(): boolean {
      return this.mouseOperation === MouseOperationType.LassoCreatePolygon;
    },
    polygonByScissors(): boolean {
      return this.mouseOperation === MouseOperationType.ScissorsCreatePolygon;
    },
    cursor(): string {
      if (this.draggable) return 'move';
      if (this.paintable || this.erasable) return 'none';
      return 'crosshair';
    },
    imgWidth(): number | null {
      return this.dataObject?.width ?? null;
    },
    imgHeight(): number | null {
      return this.dataObject?.height ?? null;
    },
  },
  watch: {
    async dataObject() {
      this.setStageSize();
      this.setImageBlur();
      this.resetStageZoom();
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

    (this.resizeObserver as ResizeObserver).disconnect();
  },
  async mounted() {
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.getContainer());

    this.setStageSize();
    this.setImageBlur();
    this.resetStageZoom();
  },
  methods: {
    onResize(): void {
      this.setStageSize();
      this.resetStageZoom();
    },
    setStageSize(): void {
      const container = this.getContainer();
      const stage = this.getStage();
      stage.width(container.clientWidth);
      stage.height(container.clientHeight);
    },
    setImageBlur(): void {
      // Set the shadow size inverse proportional to the scale
      // to make it appear invariant to scaling.
      const stage = this.getStage();
      const scale = stage.scaleX();
      if (scale === 0) return;
      this.blur = 3 / scale;
    },
    xyOffsetToStage(
      x: number,
      y: number,
      snapToPixel: boolean,
    ): { x: number, y: number } {
      // transform the position from unscaled mouse position (offsetX, offsetY)
      // to the position in the scaled coordinate of the canvas
      const stage = this.getStage();
      const stageX = stage.x();
      const stageY = stage.y();
      const scale = stage.scaleX();

      let xNew = (x - stageX) / scale;
      let yNew = (y - stageY) / scale;

      if (snapToPixel) {
        xNew = Math.floor(xNew) + 0.5;
        yNew = Math.floor(yNew) + 0.5;
      }
      return {
        x: xNew,
        y: yNew,
      };
    },
    getLabelMaskCanvas(): HTMLCanvasElement {
      // Note: this function get the label mask (2d array of integers)
      // instead of a color mask (3d array of {0, 1, ..., 255})

      const layerPaint = this.getLayerPaint();
      const stage = this.getStage();
      const imgWidth = this.imgWidth as number;
      const imgHeight = this.imgHeight as number;

      // Scale layerPaint to fit the original image size.
      // Specifically, set pixel ratio to 1 pixel in layer to 1 pixel in canvas.
      const oldScale = layerPaint.scale();
      layerPaint.scale({ x: 1 / stage.scaleX(), y: 1 / stage.scaleY() });
      const canvas = layerPaint.toCanvas({
        pixelRatio: 1,
        x: stage.x(),
        y: stage.y(),
        width: imgWidth,
        height: imgHeight,
      });
      // Clear the scale.
      layerPaint.scale(oldScale);
      // Note: the layer is not redrawn,
      // thus setting and resetting the scale will not affect the rendering result.
      return canvas;
    },
    resetStageZoom(): void {
      const { imgWidth, imgHeight } = this;
      const stage = this.getStage();

      if (imgWidth === null || imgHeight === null) return;

      const padding = 3;
      const xMin = -padding;
      const xMax = imgWidth + padding;
      const yMin = -padding;
      const yMax = imgHeight + padding;

      const zoomToWidth = xMax - xMin;
      const zoomToHeight = yMax - yMin;
      const viewPortWidth = stage.width();
      const viewPortHeight = stage.height();
      const scale = Math.min(
        viewPortWidth / zoomToWidth,
        viewPortHeight / zoomToHeight,
      );
      const cx = (xMax + xMin) / 2;
      const cy = (yMax + yMin) / 2;

      stage.scale({ x: scale, y: scale });
      stage.position({
        x: viewPortWidth / 2 - cx * scale,
        y: viewPortHeight / 2 - cy * scale,
      });
    },
    stopPolygonCreation(enableSimplify: boolean): void {
      const { strokeLabel } = this;
      const points = enableSimplify ? simplify(this.points, 0, false) : this.points;
      const labelPolygon = {
        category: strokeLabel,
        shape: ObjectShapeType.Polygon,
        position: points,
        uuid: uuidv4(),
      };
      this.$emit('create:shape', labelPolygon);

      const layerShapes = this.getLayerShapes();
      layerShapes.find('#temp-prospective-polygon-edge')
        .forEach((shape) => shape.destroy());
      layerShapes.find('#temp-prospective-polygon-closing-edge')
        .forEach((shape) => shape.destroy());
      layerShapes.find('#temp-polygon-path')
        .forEach((shape) => shape.destroy());
      this.points = [];
    },
    drawStroke(offsetX: number, offsetY: number): void {
      const {
        snapToPixel,
        strokeLabel,
        strokeShape,
        strokeWidth,
        label2color,
        erasable,
        unlabeledMark,
      } = this;

      const { x, y } = this.xyOffsetToStage(offsetX, offsetY, snapToPixel);
      const color = erasable ? label2color(unlabeledMark) : label2color(strokeLabel);

      const globalCompositeOperation = erasable ? 'destination-out' : 'source-over';
      let stroke = null;
      if (strokeShape === StrokeShapeType.Square) {
        stroke = new Konva.Rect({
          x: x - strokeWidth / 2,
          y: y - strokeWidth / 2,
          width: strokeWidth,
          height: strokeWidth,
          fill: color,
          globalCompositeOperation,
        });
      } else if (strokeShape === StrokeShapeType.Circle) {
        stroke = createCircle(strokeWidth as (1 | 5 | 15))
          .x(x - strokeWidth / 2)
          .y(y - strokeWidth / 2)
          .fill(color)
          .globalCompositeOperation(globalCompositeOperation);
      }

      const layerPaint = this.getLayerPaint();
      layerPaint.add(stroke as Konva.Shape);
    },
    drawPaintCursor(offsetX: number, offsetY: number): void {
      const {
        snapToPixel,
        strokeShape,
        strokeLabel,
        strokeWidth,
        label2color,
        erasable,
        unlabeledMark,
      } = this;

      const { x, y } = this.xyOffsetToStage(offsetX, offsetY, snapToPixel);
      const color = erasable ? label2color(unlabeledMark) : label2color(strokeLabel);

      // remove the old cursor
      const layerInteraction = this.getLayerInteraction();
      layerInteraction.find('#cursor').forEach((shape) => shape.destroy());
      let cursor = null;
      if (strokeShape === StrokeShapeType.Square) {
        cursor = new Konva.Rect({
          id: 'cursor',
          x: x - strokeWidth / 2,
          y: y - strokeWidth / 2,
          width: strokeWidth,
          height: strokeWidth,
          fill: color,
          stroke: 'black',
          strokeWidth: 0.5,
          opacity: 0.5,
        });
      } else if (strokeShape === StrokeShapeType.Circle) {
        cursor = createCircle(strokeWidth as (1 | 5 | 15))
          .id('cursor')
          .x(x - strokeWidth / 2)
          .y(y - strokeWidth / 2)
          .fill(color)
          .stroke('black')
          .strokeWidth(0.5)
          .opacity(0.5);
      }
      layerInteraction.add(cursor as Konva.Shape);
    },
    drawShapeCursor(offsetX: number, offsetY: number): void {
      const {
        strokeLabel,
        label2color,
      } = this;

      const { x, y } = this.xyOffsetToStage(offsetX, offsetY, true);
      const color = label2color(strokeLabel);

      // remove the old cursor
      const layerInteraction = this.getLayerInteraction();
      layerInteraction.find('#cursor').forEach((shape) => shape.destroy());
      const cursor = new Konva.Circle({
        x,
        y,
        id: 'cursor',
        radius: 0.5,
        stroke: color,
        strokeWidth: 0.25,
        opacity: 0.5,
      });
      layerInteraction.add(cursor);
    },
    onKey(e: KeyboardEvent): void {
      const { key } = e;
      // shortcut for stop polygon creation: Enter
      if (this.polygonByClick && key === 'Enter') {
        e.preventDefault();
        this.stopPolygonCreation(false);
      }
      if (key === 'Delete') {
        const shapes = this.getShapes();
        shapes.forEach((shape) => {
          const uuid = shape.getAttr('uuid');
          const idx = this.selectedShapeUuids.findIndex((d) => d === uuid);
          const isSelected = idx >= 0;
          if (isSelected) {
            this.$emit('delete:shape', { uuid });
            shape.destroy();
            this.selectedShapeUuids = [
              ...this.selectedShapeUuids.slice(0, idx),
              ...this.selectedShapeUuids.slice(idx + 1),
            ];
          }
        });
      }
    },
    onDragEndStage(): void {
      if (!this.snapToPixel) return;
      // if need to snap to pixel, after dragging,
      // calibrate the position to snap to pixel

      const stage = this.getStage();
      const x = stage.x();
      const y = stage.y();
      const scaleX = stage.scaleX();
      const scaleY = stage.scaleY();

      // snap to pixel by rounding
      const xSnapped = Math.round(x / scaleX) * scaleX;
      const ySnapped = Math.round(y / scaleY) * scaleY;
      stage.x(xSnapped);
      stage.y(ySnapped);
    },
    onWheelStage(e: Konva.KonvaEventObject<WheelEvent>): void {
      const {
        snapToPixel,
        boundPixelsPerRow,
        boundPixelsPerColumn,
      } = this;
      const stage = this.getStage();
      e.evt.preventDefault();
      const { deltaY } = e.evt;

      const mousePosition = stage.getPointerPosition();
      if (mousePosition === null) return;

      const factor = 1.1;
      const scaleBy = deltaY < 0 ? factor : (1 / factor);
      const mouseX = mousePosition.x;
      const mouseY = mousePosition.y;
      const mousePointTo = this.xyOffsetToStage(mouseX, mouseY, false);
      const oldScale = stage.scaleX();

      let newScale = oldScale * scaleBy;

      if (snapToPixel) {
        const viewPortWidth = stage.width();
        newScale = Math.round(newScale * viewPortWidth) / viewPortWidth;
      }

      if (boundPixelsPerRow !== null) {
        const viewPortWidth = stage.width();
        const [minPixelsPerRow, maxPixelsPerRow] = boundPixelsPerRow;
        if (viewPortWidth >= minPixelsPerRow
          && viewPortWidth / newScale < minPixelsPerRow) return;
        if (viewPortWidth <= maxPixelsPerRow
          && viewPortWidth / newScale > maxPixelsPerRow) return;
      }

      if (boundPixelsPerColumn !== null) {
        const viewPortWidth = stage.width();
        const [minPixelsPerColumn, maxPixelsPerColumn] = boundPixelsPerColumn;
        if (viewPortWidth >= minPixelsPerColumn
          && viewPortWidth / newScale < minPixelsPerColumn) return;
        if (viewPortWidth <= maxPixelsPerColumn
          && viewPortWidth / newScale > maxPixelsPerColumn) return;
      }

      stage.scale({ x: newScale, y: newScale });
      let newPos = null;
      if (snapToPixel) {
        newPos = {
          x: Math.round(-(mousePointTo.x - mouseX / newScale)) * newScale,
          y: Math.round(-(mousePointTo.y - mouseY / newScale)) * newScale,
        };
      } else {
        newPos = {
          x: -(mousePointTo.x - mouseX / newScale) * newScale,
          y: -(mousePointTo.y - mouseY / newScale) * newScale,
        };
      }

      stage.position(newPos);
      this.setImageBlur();
    },
    onMouseDownStage(e: Konva.KonvaEventObject<MouseEvent>): void {
      this.isMouseDown = true;
      const { offsetX, offsetY } = e.evt;
      if (this.paintable || this.erasable) {
        this.drawStroke(offsetX, offsetY);
      }
      if (this.polygonByLasso) {
        const { snapToPixel } = this;
        const { x, y } = this.xyOffsetToStage(offsetX, offsetY, snapToPixel);
        this.points = [[x, y]];
      }
    },
    onMouseMoveStage(e: Konva.KonvaEventObject<MouseEvent>): void {
      if (this.paintable || this.erasable) {
        const { offsetX, offsetY } = e.evt;
        this.drawPaintCursor(offsetX, offsetY);
        if (!this.isMouseDown) return;
        this.drawStroke(offsetX, offsetY);
      }
      if (this.polygonByClick
        || this.rectByClick
        || this.pointByClick
        || this.polygonByLasso
      ) {
        const { offsetX, offsetY } = e.evt;
        this.drawShapeCursor(offsetX, offsetY);
      }
      if (this.polygonByLasso) {
        if (!this.isMouseDown) return;
        const { snapToPixel, strokeLabel, label2color } = this;
        const { offsetX, offsetY } = e.evt;
        const { x, y } = this.xyOffsetToStage(offsetX, offsetY, snapToPixel);
        if (this.points.length >= 1) {
          const lastPoint = this.points[this.points.length - 1];
          if (lastPoint[0] === x && lastPoint[1] === y) {
            return;
          }
        }
        this.points = [...this.points, [x, y]];
        const color = label2color(strokeLabel);

        const { points } = this;
        const lastPoint = points[points.length - 1];
        const layerShapes = this.getLayerShapes();

        layerShapes.find('#temp-prospective-polygon-closing-edge')
          .forEach((shape) => shape.destroy());
        if (points.length >= 2) {
          const firstPoint = points[0];
          const prospectiveClosingEdge = new Konva.Line({
            id: 'temp-prospective-polygon-closing-edge',
            points: [lastPoint, firstPoint].flat(),
            stroke: 'black',
            strokeWidth: 0.25,
            opacity: 0.5,
            closed: false,
          });
          layerShapes.add(prospectiveClosingEdge);
        }

        layerShapes.find('#temp-polygon-path')
          .forEach((shape) => shape.destroy());
        const clickedPath = new Konva.Line({
          id: 'temp-polygon-path',
          points: points.flat(),
          stroke: color,
          strokeWidth: 0.25,
          closed: false,
        });
        layerShapes.add(clickedPath);
      }
      if (this.polygonByClick) {
        if (this.points.length === 0) return;
        const { snapToPixel, strokeLabel, label2color } = this;
        const { offsetX, offsetY } = e.evt;
        const { x, y } = this.xyOffsetToStage(offsetX, offsetY, snapToPixel);
        const color = label2color(strokeLabel);

        const layerShapes = this.getLayerShapes();
        layerShapes.find('#temp-prospective-polygon-edge')
          .forEach((shape) => shape.destroy());
        layerShapes.find('#temp-prospective-polygon-closing-edge')
          .forEach((shape) => shape.destroy());

        const lastPoint = this.points[this.points.length - 1];
        const currentPoint = [x, y];
        const firstPoint = this.points[0];

        const prospectiveEdge = new Konva.Line({
          id: 'temp-prospective-polygon-edge',
          points: [lastPoint, currentPoint].flat(),
          stroke: color,
          strokeWidth: 0.25,
          opacity: 0.5,
          closed: false,
        });
        layerShapes.add(prospectiveEdge);
        if (this.points.length >= 2) {
          const prospectiveClosingEdge = new Konva.Line({
            id: 'temp-prospective-polygon-closing-edge',
            points: [currentPoint, firstPoint].flat(),
            stroke: 'black',
            strokeWidth: 0.25,
            opacity: 0.5,
            closed: false,
          });
          layerShapes.add(prospectiveClosingEdge);
        }
      }
      if (this.rectByClick) {
        if (this.points.length !== 1) return;
        const { snapToPixel, strokeLabel, label2color } = this;
        const { offsetX, offsetY } = e.evt;
        const { x, y } = this.xyOffsetToStage(offsetX, offsetY, snapToPixel);
        const color = label2color(strokeLabel);

        const layerShapes = this.getLayerShapes();
        layerShapes.find('#temp-prospective-rect')
          .forEach((shape) => shape.destroy());

        const firstPoint = this.points[0];
        const currentPoint = [x, y];
        const xMin = Math.min(firstPoint[0], currentPoint[0]);
        const xMax = Math.max(firstPoint[0], currentPoint[0]);
        const yMin = Math.min(firstPoint[1], currentPoint[1]);
        const yMax = Math.max(firstPoint[1], currentPoint[1]);
        const width = xMax - xMin;
        const height = yMax - yMin;

        const prospectiveRect = new Konva.Rect({
          id: 'temp-prospective-rect',
          x: xMin,
          y: yMin,
          width,
          height,
          stroke: color,
          strokeWidth: 0.25,
          opacity: 0.5,
        });
        layerShapes.add(prospectiveRect);
      }
    },
    onMouseUpStage(): void {
      this.isMouseDown = false;
      if (this.paintable || this.erasable) {
        const canvas = this.getLabelMaskCanvas();
        this.$emit('update:mask', canvas);
      }
      if (this.polygonByLasso) {
        this.stopPolygonCreation(true);
      }
    },
    onMouseOutStage(): void {
      // Note: @mouseout of layer is incorrectly fired when the mouse is moving quickly.
      // As a solution, mouseout is currently bound to the card.
      this.isMouseDown = false;

      // clear the paint brush drawn in the interaction layer
      const layerInteraction = this.getLayerInteraction();
      layerInteraction.destroyChildren();
    },
    onClickStage(e: Konva.KonvaEventObject<MouseEvent>): void {
      const { snapToPixel, strokeLabel, label2color } = this;
      const { offsetX, offsetY } = e.evt;
      const { x, y } = this.xyOffsetToStage(offsetX, offsetY, snapToPixel);
      const layerShapes = this.getLayerShapes();
      if (this.pointByClick) {
        const labelCircle: ILabelShape = {
          category: strokeLabel,
          shape: ObjectShapeType.Point,
          position: [x, y],
          uuid: uuidv4(),
        };
        this.$emit('create:shape', labelCircle);
      } else if (this.polygonByClick) {
        const color = label2color(strokeLabel);
        if (this.points.length >= 1) {
          const lastPoint = this.points[this.points.length - 1];
          if (lastPoint[0] === x && lastPoint[1] === y) {
            return;
          }
        }
        this.points = [...this.points, [x, y]];

        layerShapes.find('#temp-polygon-path')
          .forEach((shape) => shape.destroy());
        const clickedPath = new Konva.Line({
          id: 'temp-polygon-path',
          points: this.points.flat(),
          stroke: color,
          strokeWidth: 0.25,
          closed: false,
        });
        layerShapes.add(clickedPath);
      } else if (this.rectByClick) {
        if (this.points.length === 0) {
          this.points = [[x, y]];
        } else if (this.points.length === 1) {
          const { points } = this;
          layerShapes.find('#temp-prospective-rect')
            .forEach((shape) => shape.destroy());
          this.points = [];

          const labelRect: ILabelShape = {
            category: strokeLabel,
            shape: ObjectShapeType.Rect,
            position: [...points, [x, y]],
            uuid: uuidv4(),
          };
          this.$emit('create:shape', labelRect);
        }
      }

      // Deselect the previous selected objects.
      if (this.editable && e.target === this.getStage()) {
        this.selectedShapeUuids = [];
      }
    },
    onUpdateSelectedShapes(uuids: string[]): void {
      this.selectedShapeUuids = uuids;
    },
    getContainer(): HTMLElement {
      return this.$refs.container as HTMLElement;
    },
    getLayerInteraction(): Konva.Layer {
      return (this.$refs.layerInteraction as VueKonvaLayer).getNode();
    },
    getLayerPaint(): Konva.Layer {
      const component = this.$refs.layerPaint as Vue & { getLayer: () => Konva.Layer };
      return component.getLayer();
    },
    getLayerShapes(): Konva.Layer {
      const component = this.$refs.layerShapes as Vue & { getLayer: () => Konva.Layer };
      return component.getLayer();
    },
    getShapes(): Konva.Shape[] {
      const component = this.$refs.layerShapes as Vue & { getShapes: () => Konva.Shape[] };
      return component.getShapes();
    },
    getStage(): Konva.Stage {
      return (this.$refs.stage as unknown as Konva.Stage).getStage() as Konva.Stage;
    },
  },
});
</script>

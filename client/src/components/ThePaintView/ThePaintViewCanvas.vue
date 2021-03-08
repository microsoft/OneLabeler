<template>
  <v-container
    ref="container"
    class="pa-0 ma-0"
    style="background-color: #D0DAE8"
    fill-height
    fluid
    @mouseout="onMouseOutStage"
  >
    <v-stage
      ref="stage"
      :config="{ draggable: draggable }"
      :style="{ cursor: cursor }"
      @dragend="onDragEndStage"
      @wheel="onWheelStage"
      @mousedown="onMouseDownStage"
      @mousemove="onMouseMoveStage"
      @mouseup="onMouseUpStage"
      @click="onClickStage"
    >
      <v-layer
        :config="{ imageSmoothingEnabled: false }"
        style="image-rendering: pixelated"
      >
        <v-image
          ref="image"
          :config="{
            image,
            shadowColor: 'black',
            shadowOpacity: 0.4,
          }"
        />
      </v-layer>
      <v-layer
        ref="layerPaint"
        :config="{
          imageSmoothingEnabled: false,
          clip: {
            x: 0,
            y: 0,
            width: imgWidth,
            height: imgHeight,
          },
        }"
        style="image-rendering: pixelated"
      />
      <v-layer
        ref="layerGeometricObjects"
        :config="{ imageSmoothingEnabled: false }"
        style="image-rendering: pixelated"
      />
      <v-layer
        ref="layerInteraction"
        :config="{ imageSmoothingEnabled: false }"
        style="image-rendering: pixelated"
      />
    </v-stage>
  </v-container>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import simplify from '@/plugins/simplify';
import {
  IImage,
  Label,
  ILabelMask,
  ILabelGeometricObject,
  ObjectShapeType,
} from '@/commons/types';
import imageURLFormatter from '@/services/image-url';
import {
  MouseOperationType,
  StrokeShapeType,
  IEditableShape,
} from './types';
import { createCircle } from './pixelated-circle';
import EditableCircle from './editable-circle';
import EditableRect from './editable-rect';
import EditablePolygon from './editable-polygon';

export default Vue.extend({
  name: 'VPaintBody',
  props: {
    dataObject: {
      type: Object as PropType<IImage>,
      required: true,
    },
    labelGeometricObjects: {
      type: Array as PropType<ILabelGeometricObject[]>,
      required: true,
    },
    labelMask: {
      type: Object as PropType<ILabelMask>,
      required: true,
    },
    unlabeledMark: {
      type: String as PropType<Label>,
      required: true,
    },
    /** @param {Number} strokeLabel currently selected category for stroke */
    strokeLabel: {
      type: String as PropType<Label>,
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
  data(): {
    resizeObserver: ResizeObserver | null,
    snapToPixel: boolean,
    image: HTMLImageElement | null,
    isMouseDown: boolean,
    boundPixelsPerRow: [number, number] | null,
    boundPixelsPerColumn: [number, number] | null,
    points: [number, number][],
    } {
    return {
      resizeObserver: null,
      // Whether to snap the canvas to ensure pixel edges align with the canvas edge.
      snapToPixel: true,
      image: null,
      isMouseDown: false,
      boundPixelsPerRow: [10, 2000],
      boundPixelsPerColumn: [10, 2000],
      points: [],
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
      return this.mouseOperation === MouseOperationType.EditGeometricObject;
    },
    polygonClickStageCreateable(): boolean {
      return this.mouseOperation === MouseOperationType.ClickCreatePolygon;
    },
    rectClickCreateable(): boolean {
      return this.mouseOperation === MouseOperationType.ClickCreateRect;
    },
    pointClickCreateable(): boolean {
      return this.mouseOperation === MouseOperationType.ClickCreatePoint;
    },
    polygonLassoCreateable(): boolean {
      return this.mouseOperation === MouseOperationType.LassoCreatePolygon;
    },
    cursor(): string {
      if (this.draggable) return 'move';
      if (this.paintable || this.erasable) return 'none';
      return 'crosshair';
    },
    imgWidth(): number | null {
      if (this.dataObject === null) return null;
      return this.dataObject.width as number;
    },
    imgHeight(): number | null {
      if (this.dataObject === null) return null;
      return this.dataObject.height as number;
    },
  },
  watch: {
    dataObject() {
      this.setStageSize();
      // Loading image from url is asynchronous,
      // thus first set the image to null to avoid bumping effect.
      this.image = null;
      this.setImage();
      this.resetZoom();
      this.drawLabelMask();
      this.drawEditableShapes();
    },
    editable() {
      const layerGeometricObjects = (this.$refs.layerGeometricObjects as any)
        .getNode() as Konva.Layer;
      const shapes = layerGeometricObjects.find('.editable-shape');
      shapes.each((shape) => {
        const editableShape = shape.getAttr('object') as IEditableShape;
        editableShape.editable(this.editable);
      });
      layerGeometricObjects.batchDraw();
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
  mounted() {
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.$refs.container as HTMLElement);

    this.setStageSize();

    // Note: set canvas style opacity instead of in configuration
    // if set opacity in configuration,
    // each object would be transparent but not the whole canvas
    const layerPaint = (this.$refs.layerPaint as any).getNode() as Konva.Layer;
    // eslint-disable-next-line no-underscore-dangle
    const canvas = layerPaint.getCanvas()._canvas;
    canvas.style.opacity = '0.5';

    // render the image if it is given
    this.setImage();
    this.drawLabelMask();
    this.drawEditableShapes();

    this.resetZoom();
  },
  methods: {
    onResize(): void {
      this.setStageSize();
      this.resetZoom();
    },
    setStageSize(): void {
      const { container } = this.$refs as { container: HTMLElement };
      const stage = (this.$refs.stage as unknown as Konva.Stage).getStage();
      stage.width(container.clientWidth);
      stage.height(container.clientHeight);
    },
    setImage(): void {
      const { path } = this.dataObject;
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        this.image = img;
        this.setImageBlur();
      };
      img.src = imageURLFormatter(path as string);
    },
    setImageBlur(): void {
      const stage = (this.$refs.stage as unknown as Konva.Stage).getStage();
      const image = (this.$refs.image as any).getNode() as Konva.Image;

      // Set the shadow size inverse proportional to the scale
      // to make it appear invariant to scaling.
      const scale = stage.scaleX();
      image.shadowBlur(3 / scale);
      image.shadowOffset({ x: 3 / scale, y: 3 / scale });
    },
    xyWindowToCanvas(
      x: number,
      y: number,
      snapToPixel: boolean,
    ): { x: number, y: number } {
      // transform the position from unscaled mouse position (offsetX, offsetY)
      // to the position in the scaled coordinate of the canvas
      const stage = (this.$refs.stage as unknown as Konva.Stage).getStage();
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
    calLabelMaskCanvas(): HTMLCanvasElement {
      // Note: this funtion get the label mask (2d array of integers)
      // instead of a color mask (3d array of {0, 1, ..., 255})

      const layerPaint = (this.$refs.layerPaint as any).getNode() as Konva.Layer;
      const stage = (this.$refs.stage as any).getNode() as Konva.Stage;
      const imgWidth = this.imgWidth as number;
      const imgHeight = this.imgHeight as number;

      // Scale layerPaint to fit the original image size.
      // Specifically, set pixel ratio to 1 pixel in layer to 1 pixel in canvas.
      layerPaint.scale({ x: 1 / stage.scaleX(), y: 1 / stage.scaleY() });
      const canvas = layerPaint.toCanvas({
        pixelRatio: 1,
        x: stage.x(),
        y: stage.y(),
        width: imgWidth,
        height: imgHeight,
      });
      // Clear the scale.
      layerPaint.scale({ x: 1, y: 1 });
      return canvas;
    },
    resetZoom(): void {
      const { imgWidth, imgHeight } = this;
      const stage = (this.$refs.stage as unknown as Konva.Stage).getStage();

      const padding = 3;
      const xMin = -padding;
      const xMax = (imgWidth as number) + padding;
      const yMin = -padding;
      const yMax = (imgHeight as number) + padding;

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
      stage.batchDraw();
    },
    stopPolygonCreation(enableSimplify: boolean): void {
      const { strokeLabel } = this;
      const points = enableSimplify ? simplify(this.points, 0, false) : this.points;
      const labelPolygon = {
        label: strokeLabel,
        shape: ObjectShapeType.Polygon,
        position: points,
        uuid: uuidv4(),
      };
      this.$emit('add-label-geometric-object', labelPolygon);

      const layerGeometricObjects = (this.$refs.layerGeometricObjects as any)
        .getNode() as Konva.Layer;
      layerGeometricObjects.find('#temp-prospective-polygon-edge')
        .each((shape) => shape.destroy());
      layerGeometricObjects.find('#temp-prospective-polygon-closing-edge')
        .each((shape) => shape.destroy());
      layerGeometricObjects.find('#temp-polygon-path')
        .each((shape) => shape.destroy());

      this.drawEditablePolygon(labelPolygon);
      layerGeometricObjects.draw();
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

      const { x, y } = this.xyWindowToCanvas(offsetX, offsetY, snapToPixel);
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

      const layerPaint = (this.$refs.layerPaint as any).getNode() as Konva.Layer;
      layerPaint.add(stroke as Konva.Shape);
      layerPaint.batchDraw();
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

      const { x, y } = this.xyWindowToCanvas(offsetX, offsetY, snapToPixel);
      const color = erasable ? label2color(unlabeledMark) : label2color(strokeLabel);

      // remove the old cursor
      const layerInteraction = (this.$refs.layerInteraction as any)
        .getNode() as Konva.Layer;
      layerInteraction.find('#cursor').each((shape) => shape.destroy());
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
      layerInteraction.batchDraw();
    },
    drawShapeCursor(offsetX: number, offsetY: number): void {
      const {
        strokeLabel,
        label2color,
      } = this;

      const { x, y } = this.xyWindowToCanvas(offsetX, offsetY, true);
      const color = label2color(strokeLabel);

      // remove the old cursor
      const layerInteraction = (this.$refs.layerInteraction as any).getNode() as Konva.Layer;
      layerInteraction.find('#cursor').each((shape) => shape.destroy());
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
      layerInteraction.batchDraw();
    },
    drawLabelMask(): void {
      const { labelMask } = this;
      const layerPaint = (this.$refs.layerPaint as any).getNode() as Konva.Layer;

      // clean layerPaint
      layerPaint.destroyChildren();

      if (labelMask === null || labelMask.path === null) {
        layerPaint.batchDraw();
        return;
      }

      const { path } = labelMask;
      const image = new Image();
      image.crossOrigin = 'Anonymous';
      image.onload = () => {
        const labelImage = new Konva.Image({ image });
        layerPaint.add(labelImage);
        layerPaint.draw();
      };
      image.src = imageURLFormatter(path as string);
    },
    drawEditableCircle(labelCircle: ILabelGeometricObject): void {
      const { label2color, editable } = this;
      const layerGeometricObjects = (this.$refs.layerGeometricObjects as any)
        .getNode() as Konva.Layer;
      const [x, y] = labelCircle.position as [number, number];
      const { label, uuid } = labelCircle;

      const editableCircle = new EditableCircle({ x, y }, layerGeometricObjects, editable);
      const circle = editableCircle.getNode()
        .stroke(label2color(label))
        .name('editable-shape')
        .setAttr('object', editableCircle)
        .setAttr('uuid', uuid);
      editableCircle.setOnUpdatePosition((d: EditableCircle) => {
        const point = d.point();
        this.$emit('update-label-geometric-object', {
          label,
          shape: ObjectShapeType.Point,
          position: [point.x, point.y],
          uuid,
        });
      });
      editableCircle.setOnClick(() => {
        circle.addName('clicked-shape');
      });
      layerGeometricObjects.add(circle);
    },
    drawEditableRect(labelRect: ILabelGeometricObject): void {
      const { label2color, editable } = this;
      const layerGeometricObjects = (this.$refs.layerGeometricObjects as any)
        .getNode() as Konva.Layer;
      const points = labelRect.position as [number, number][];
      const { label, uuid } = labelRect;

      const editableRect = new EditableRect(points, layerGeometricObjects, editable);
      const group = editableRect.getNode()
        .name('editable-shape')
        .setAttr('object', editableRect)
        .setAttr('uuid', uuid);
      editableRect.getRect()
        .stroke(label2color(label));
      editableRect.setOnUpdatePosition((d: EditableRect) => {
        this.$emit('update-label-geometric-object', {
          label,
          shape: ObjectShapeType.Rect,
          position: d.points(),
          uuid,
        });
      });
      editableRect.setOnClick(() => {
        group.addName('clicked-shape');
      });
      layerGeometricObjects.add(group);
    },
    drawEditablePolygon(labelPolygon: ILabelGeometricObject): void {
      const { label2color, editable } = this;
      const layerGeometricObjects = (this.$refs.layerGeometricObjects as any)
        .getNode() as Konva.Layer;
      const points = labelPolygon.position as [number, number][];
      const { label, uuid } = labelPolygon;

      const editablePolygon = new EditablePolygon(points, layerGeometricObjects, editable);
      const group = editablePolygon.getNode()
        .name('editable-shape')
        .setAttr('object', editablePolygon)
        .setAttr('uuid', uuid);
      editablePolygon.getPolygon()
        .stroke(label2color(label));
      editablePolygon.setOnUpdatePosition((d: EditablePolygon) => {
        this.$emit('update-label-geometric-object', {
          label,
          shape: ObjectShapeType.Polygon,
          position: d.points(),
          uuid,
        });
      });
      editablePolygon.setOnClick(() => {
        group.addName('clicked-shape');
      });
      layerGeometricObjects.add(group);
    },
    drawEditableShapes(): void {
      const { labelGeometricObjects } = this;
      const layerGeometricObjects = (this.$refs.layerGeometricObjects as any)
        .getNode() as Konva.Layer;

      // clean layerGeometricObjects
      layerGeometricObjects.destroyChildren();
      if (labelGeometricObjects !== null) {
        labelGeometricObjects.forEach((d: ILabelGeometricObject) => {
          if (d.shape === ObjectShapeType.Point) {
            this.drawEditableCircle(d);
          } else if (d.shape === ObjectShapeType.Rect) {
            this.drawEditableRect(d);
          } else if (d.shape === ObjectShapeType.Polygon) {
            this.drawEditablePolygon(d);
          }
        });
      }
      layerGeometricObjects.draw();
    },
    onKey(e: KeyboardEvent): void {
      const { key } = e;
      // shortcut for stop polygon creation: Enter
      if (this.polygonClickStageCreateable && key === 'Enter') {
        e.preventDefault();
        this.stopPolygonCreation(false);
      }
      if (key === 'Delete') {
        const layerGeometricObjects = (this.$refs.layerGeometricObjects as any)
          .getNode() as Konva.Layer;
        const shapes = layerGeometricObjects.find('.clicked-shape');
        shapes.each((shape) => {
          const uuid = shape.getAttr('uuid');
          this.$emit('remove-label-geometric-object', {
            uuid,
          });
          shape.destroy();
        });
        layerGeometricObjects.draw();
      }
    },
    onDragEndStage(): void {
      if (!this.snapToPixel) return;
      // if need to snap to pixel, after dragging,
      // calibrate the position to snap to pixel

      const stage = (this.$refs.stage as unknown as Konva.Stage).getStage();
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
      const stage = (this.$refs.stage as unknown as Konva.Stage).getStage();
      e.evt.preventDefault();

      const mousePosition = stage.getPointerPosition();
      if (mousePosition === null) return;

      const scaleBy = 1.1;
      const mouseX = mousePosition.x;
      const mouseY = mousePosition.y;
      const mousePointTo = this.xyWindowToCanvas(mouseX, mouseY, false);
      const oldScale = stage.scaleX();

      let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

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
      stage.batchDraw();
    },
    onMouseDownStage(e: Konva.KonvaEventObject<MouseEvent>): void {
      this.isMouseDown = true;
      if (this.paintable || this.erasable) {
        const { offsetX, offsetY } = e.evt;
        this.drawStroke(offsetX, offsetY);
      }
      if (this.polygonLassoCreateable) {
        const { snapToPixel } = this;
        const { offsetX, offsetY } = e.evt;
        const { x, y } = this.xyWindowToCanvas(offsetX, offsetY, snapToPixel);
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
      if (this.polygonClickStageCreateable
        || this.rectClickCreateable
        || this.pointClickCreateable
        || this.polygonLassoCreateable
      ) {
        const { offsetX, offsetY } = e.evt;
        this.drawShapeCursor(offsetX, offsetY);
      }
      if (this.polygonLassoCreateable) {
        if (!this.isMouseDown) return;
        const { snapToPixel, strokeLabel, label2color } = this;
        const { offsetX, offsetY } = e.evt;
        const { x, y } = this.xyWindowToCanvas(offsetX, offsetY, snapToPixel);
        if (this.points.length >= 1) {
          const lastPoint = this.points[this.points.length - 1];
          if (lastPoint[0] === x && lastPoint[1] === y) {
            return;
          }
        }
        this.points = [...this.points, [x, y]];
        const color = label2color(strokeLabel);

        const layerGeometricObjects = (this.$refs.layerGeometricObjects as any)
          .getNode() as Konva.Layer;

        layerGeometricObjects.find('#temp-prospective-polygon-closing-edge')
          .each((shape) => shape.destroy());
        if (this.points.length >= 2) {
          const firstPoint = this.points[0];
          const prospectiveClosingEdge = new Konva.Line({
            id: 'temp-prospective-polygon-closing-edge',
            points: [[x, y], firstPoint].flat(),
            stroke: 'black',
            strokeWidth: 0.25,
            opacity: 0.5,
            closed: false,
          });
          layerGeometricObjects.add(prospectiveClosingEdge);
        }

        layerGeometricObjects.find('#temp-polygon-path')
          .each((shape) => shape.destroy());
        const clickedPath = new Konva.Line({
          id: 'temp-polygon-path',
          points: this.points.flat(),
          stroke: color,
          strokeWidth: 0.25,
          closed: false,
        });
        layerGeometricObjects.add(clickedPath);
        layerGeometricObjects.batchDraw();
      }
      if (this.polygonClickStageCreateable) {
        if (this.points.length === 0) return;
        const { snapToPixel, strokeLabel, label2color } = this;
        const { offsetX, offsetY } = e.evt;
        const { x, y } = this.xyWindowToCanvas(offsetX, offsetY, snapToPixel);
        const color = label2color(strokeLabel);

        const layerGeometricObjects = (this.$refs.layerGeometricObjects as any)
          .getNode() as Konva.Layer;
        layerGeometricObjects.find('#temp-prospective-polygon-edge')
          .each((shape) => shape.destroy());
        layerGeometricObjects.find('#temp-prospective-polygon-closing-edge')
          .each((shape) => shape.destroy());

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
        layerGeometricObjects.add(prospectiveEdge);
        if (this.points.length >= 2) {
          const prospectiveClosingEdge = new Konva.Line({
            id: 'temp-prospective-polygon-closing-edge',
            points: [currentPoint, firstPoint].flat(),
            stroke: 'black',
            strokeWidth: 0.25,
            opacity: 0.5,
            closed: false,
          });
          layerGeometricObjects.add(prospectiveClosingEdge);
        }
        layerGeometricObjects.batchDraw();
      }
      if (this.rectClickCreateable) {
        if (this.points.length !== 1) return;
        const { snapToPixel, strokeLabel, label2color } = this;
        const { offsetX, offsetY } = e.evt;
        const { x, y } = this.xyWindowToCanvas(offsetX, offsetY, snapToPixel);
        const color = label2color(strokeLabel);

        const layerGeometricObjects = (this.$refs.layerGeometricObjects as any)
          .getNode() as Konva.Layer;
        layerGeometricObjects.find('#temp-prospective-rect')
          .each((shape) => shape.destroy());

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
        layerGeometricObjects.add(prospectiveRect);
        layerGeometricObjects.batchDraw();
      }
    },
    onMouseUpStage(): void {
      this.isMouseDown = false;
      if (this.paintable || this.erasable) {
        const canvas = this.calLabelMaskCanvas();
        this.$emit('set-label-mask', canvas);
      }
      if (this.polygonLassoCreateable) {
        this.stopPolygonCreation(true);
      }
    },
    onMouseOutStage(): void {
      // Note: @mouseout of layer is incorrectly fired when the mouse is moving quickly.
      // As a solution, mouseout is currently bound to the card.
      this.isMouseDown = false;

      // clear the paint brush drawn in the interaction layer
      const layerInteraction = (this.$refs.layerInteraction as any).getNode() as Konva.Layer;
      layerInteraction.destroyChildren();
      layerInteraction.draw();
    },
    onClickStage(e: Konva.KonvaEventObject<MouseEvent>): void {
      const { snapToPixel, strokeLabel, label2color } = this;
      const { offsetX, offsetY } = e.evt;
      const { x, y } = this.xyWindowToCanvas(offsetX, offsetY, snapToPixel);
      const layerGeometricObjects = (this.$refs.layerGeometricObjects as any)
        .getNode() as Konva.Layer;
      if (this.pointClickCreateable) {
        const labelCircle: ILabelGeometricObject = {
          label: strokeLabel,
          shape: ObjectShapeType.Point,
          position: [x, y],
          uuid: uuidv4(),
        };
        this.drawEditableCircle(labelCircle);
        layerGeometricObjects.draw();
        this.$emit('add-label-geometric-object', labelCircle);
      } else if (this.polygonClickStageCreateable) {
        const color = label2color(strokeLabel);
        if (this.points.length >= 1) {
          const lastPoint = this.points[this.points.length - 1];
          if (lastPoint[0] === x && lastPoint[1] === y) {
            return;
          }
        }
        this.points = [...this.points, [x, y]];

        layerGeometricObjects.find('#temp-polygon-path')
          .each((shape) => shape.destroy());
        const clickedPath = new Konva.Line({
          id: 'temp-polygon-path',
          points: this.points.flat(),
          stroke: color,
          strokeWidth: 0.25,
          closed: false,
        });
        layerGeometricObjects.add(clickedPath);
        layerGeometricObjects.batchDraw();
      } else if (this.rectClickCreateable) {
        if (this.points.length === 0) {
          this.points = [[x, y]];
        } else if (this.points.length === 1) {
          const { points } = this;
          layerGeometricObjects.find('#temp-prospective-rect')
            .each((shape) => shape.destroy());
          this.points = [];

          const labelRect: ILabelGeometricObject = {
            label: strokeLabel,
            shape: ObjectShapeType.Rect,
            position: [...points, [x, y]],
            uuid: uuidv4(),
          };
          this.drawEditableRect(labelRect);
          layerGeometricObjects.draw();
          this.$emit('add-label-geometric-object', labelRect);
        }
      }

      // Deselect the previous selected objects.
      if (this.editable) {
        const { target } = e;
        layerGeometricObjects.find('.clicked-shape').each((shape: Konva.Node) => {
          // Keep the newly selected object selected.
          const editableShape = shape.getAttr('object') as IEditableShape;
          if (editableShape instanceof EditableCircle) {
            if (shape === target) return;
          } else if (editableShape instanceof EditableRect) {
            if (shape === target.getParent()) return;
          } else if (editableShape instanceof EditablePolygon) {
            if (shape === target.getParent()) return;
          }
          editableShape.endEdit();
          shape.removeName('clicked-shape');
        });
        layerGeometricObjects.draw();
      }
    },
  },
});
</script>

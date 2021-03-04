<template>
  <v-container
    ref="container"
    class="pa-0 ma-0"
    style="background-color: #D0DAE8"
    fill-height
    fluid
    @mouseout="onMouseOut"
  >
    <v-stage
      ref="stage"
      :config="{ draggable: draggable }"
      :style="{ cursor: paintable ? 'none' : null }"
      @dragmove="onDragMove"
      @wheel="onWheel"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
    >
      <v-layer
        :config="{ imageSmoothingEnabled: false }"
        style="image-rendering: pixelated"
      >
        <!--shadowBlur: 0,
            shadowOffset: { x: 3, y: 3 },-->
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
import {
  IImage,
  Label,
  ILabelMask,
} from '@/commons/types';
import imageURLFormatter from '@/services/image-url';
import { MouseOperationType, StrokeShapeType } from './types';
import { createCircle } from './pixelated-circle';

enum PaintToolType {
  Pencil = 'Pencil',
  Eraser = 'Eraser',
}

export default Vue.extend({
  name: 'VPaintBody',
  props: {
    dataObject: {
      type: Object as PropType<IImage>,
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
      required: true,
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
    snapToPixel: boolean,
    image: HTMLImageElement | null,
    isMouseDown: boolean,
    boundPixelsPerRow: [number, number] | null,
    boundPixelsPerColumn: [number, number] | null,
    } {
    return {
      // Whether to snap the canvas to ensure pixel edges align with the canvas edge.
      snapToPixel: true,
      image: null,
      isMouseDown: false,
      boundPixelsPerRow: [10, 2000],
      boundPixelsPerColumn: [10, 2000],
    };
  },
  computed: {
    draggable(): boolean {
      return this.mouseOperation === MouseOperationType.PanAndZoom;
    },
    paintable(): boolean {
      return this.mouseOperation === MouseOperationType.PaintBrush;
    },
    paintTool(): PaintToolType {
      if (this.strokeLabel === this.unlabeledMark) return PaintToolType.Eraser;
      return PaintToolType.Pencil;
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
      this.setImage();
      this.drawLabelMask();
    },
  },
  mounted() {
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

    this.resetZoom();
  },
  methods: {
    setStageSize(): void {
      const { container } = this.$refs as { container: HTMLElement };
      const stage = (this.$refs.stage as unknown as Konva.Stage).getStage();
      stage.setAttr('width', container.clientWidth)
        .setAttr('height', container.clientHeight);
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
        xNew = Math.round(xNew) + 0.5;
        yNew = Math.round(yNew) + 0.5;
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
    drawStroke(offsetX: number, offsetY: number): void {
      const {
        snapToPixel,
        strokeLabel,
        strokeShape,
        strokeWidth,
        label2color,
        paintTool,
      } = this;

      const { x, y } = this.xyWindowToCanvas(offsetX, offsetY, snapToPixel);
      const color = label2color(strokeLabel);

      const globalCompositeOperation = paintTool === PaintToolType.Eraser
        ? 'destination-out' : 'source-over';
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
        stroke = createCircle(strokeWidth)
          .x(x - strokeWidth / 2)
          .y(y - strokeWidth / 2)
          .fill(color)
          .globalCompositeOperation(globalCompositeOperation);
      }

      const layerPaint = (this.$refs.layerPaint as any).getNode() as Konva.Layer;
      layerPaint.add(stroke);
      layerPaint.batchDraw();
    },
    drawCursor(offsetX: number, offsetY: number): void {
      const {
        snapToPixel,
        strokeShape,
        strokeLabel,
        strokeWidth,
        label2color,
      } = this;

      const { x, y } = this.xyWindowToCanvas(offsetX, offsetY, snapToPixel);
      const color = label2color(strokeLabel);

      // remove the old cursor
      const layerInteraction = (this.$refs.layerInteraction as any).getNode() as Konva.Layer;
      layerInteraction.find('#cursor').remove();
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
          strokeWidth: 1,
          opacity: 0.5,
        });
      } else if (strokeShape === StrokeShapeType.Circle) {
        cursor = createCircle(strokeWidth)
          .id('cursor')
          .x(x - strokeWidth / 2)
          .y(y - strokeWidth / 2)
          .fill(color)
          .stroke('black')
          .strokeWidth(1)
          .opacity(0.5);
      }
      layerInteraction.add(cursor);
      layerInteraction.batchDraw();
    },
    drawLabelMask(): void {
      const { labelMask } = this;
      const layerPaint = (this.$refs.layerPaint as any).getNode() as Konva.Layer;

      // clean layerPaint
      layerPaint.destroyChildren();

      if (labelMask === null || labelMask.path === null) return;

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
    onDragMove(e: MouseEvent): void {
      if (!this.snapToPixel) return;
      // if need to snap to pixel, after dragging,
      // calibrate the position to snap to pixel

      const stage = e.target as unknown as Konva.Stage;
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
    onWheel(e: { evt: WheelEvent }): void {
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
    onMouseDown(e: { evt: MouseEvent }): void {
      if (!this.paintable) return;
      this.isMouseDown = true;
      const { offsetX, offsetY } = e.evt;
      this.drawStroke(offsetX, offsetY);
    },
    onMouseMove(e: { evt: MouseEvent }): void {
      if (!this.paintable) return;
      const { offsetX, offsetY } = e.evt;
      this.drawCursor(offsetX, offsetY);
      if (!this.isMouseDown) return;
      this.drawStroke(offsetX, offsetY);
    },
    onMouseUp(): void {
      this.isMouseDown = false;
      if (!this.paintable) return;
      const canvas = this.calLabelMaskCanvas();
      this.$emit('update-label-mask', canvas);
    },
    onMouseOut(): void {
      // Note: @mouseout of layer is incorrectly fired when the mouse is moving quickly.
      // As a solution, mouseout is currently bound to the card.
      this.isMouseDown = false;
      const layerInteraction = (this.$refs.layerInteraction as any).getNode() as Konva.Layer;
      layerInteraction.destroyChildren();
      layerInteraction.draw();
    },
  },
});
</script>

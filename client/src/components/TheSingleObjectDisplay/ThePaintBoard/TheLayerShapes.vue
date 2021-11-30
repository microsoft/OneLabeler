<template>
  <v-layer
    ref="layer"
    :config="{ imageSmoothingEnabled: false }"
    style="image-rendering: pixelated"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import Konva from 'konva';
import { ObjectShapeType } from '@/commons/types';
import type { ILabelShape } from '@/commons/types';
import type { IEditableShape, VueKonvaLayer } from './types';
import EditableCircle from './editable-circle';
import EditableRect from './editable-rect';
import EditablePolygon from './editable-polygon';

export default defineComponent({
  name: 'TheLayerShapes',
  props: {
    labelShapes: {
      type: Array as PropType<ILabelShape[] | null>,
      default: null,
    },
    selectedShapeUuids: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    editable: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  emits: {
    'update:shape': null,
    'update:selected-shapes': null,
  },
  data() {
    return {
      shapeName: 'editable-shape',
    };
  },
  watch: {
    labelShapes() {
      // TODO: avoid redrawing everything to accelerate
      this.drawEditableShapes();
    },
    selectedShapeUuids() {
      this.drawEditState();
    },
    editable() {
      const shapes = this.getShapes();
      shapes.forEach((shape) => {
        const editableShape = shape.getAttr('object') as IEditableShape;
        editableShape.editable(this.editable);
      });
    },
  },
  mounted() {
    this.drawEditableShapes();
  },
  methods: {
    getLayer(): Konva.Layer {
      return (this.$refs.layer as VueKonvaLayer).getNode();
    },
    getShapes(): Konva.Node[] {
      const layer = this.getLayer();
      return layer.find(`.${this.shapeName}`);
    },
    drawEditState(): void {
      const uuids = this.selectedShapeUuids;
      const shapes = this.getShapes();
      shapes.forEach((shape) => {
        const uuid = shape.getAttr('uuid') as string;
        const isSelected = uuids.findIndex((d) => d === uuid) >= 0;
        const editableShape = shape.getAttr('object') as IEditableShape;
        if (!isSelected) {
          editableShape.endEdit();
        } else {
          editableShape.startEdit();
        }
      });
    },
    drawEditableCircle(labelCircle: ILabelShape): void {
      const { label2color, editable, shapeName } = this;
      const layer = this.getLayer();
      const [x, y] = labelCircle.position as [number, number];
      const { category, uuid } = labelCircle;

      const editableCircle = new EditableCircle(
        { x, y },
        editable,
      );
      const circle = editableCircle.getNode()
        .stroke(label2color(category))
        .name(shapeName)
        .setAttr('object', editableCircle)
        .setAttr('uuid', uuid);
      editableCircle.setOnUpdatePosition((d: EditableCircle) => {
        const point = d.point();
        this.$emit('update:shape', {
          category,
          shape: ObjectShapeType.Point,
          position: [point.x, point.y],
          uuid,
        });
      });
      editableCircle.setOnClick(() => {
        this.$emit('update:selected-shapes', [uuid]);
      });
      layer.add(circle);
    },
    drawEditableRect(labelRect: ILabelShape): void {
      const { label2color, editable, shapeName } = this;
      const layer = this.getLayer();
      const points = labelRect.position as [number, number][];
      const { category, uuid } = labelRect;

      const editableRect = new EditableRect(points, editable);
      const group = editableRect.getNode()
        .name(shapeName)
        .setAttr('object', editableRect)
        .setAttr('uuid', uuid);
      editableRect.getRect()
        .stroke(label2color(category));
      editableRect.setOnUpdatePosition((d: EditableRect) => {
        this.$emit('update:shape', {
          category,
          shape: ObjectShapeType.Rect,
          position: d.points(),
          uuid,
        });
      });
      editableRect.setOnClick(() => {
        this.$emit('update:selected-shapes', [uuid]);
      });
      layer.add(group);
    },
    drawEditablePolygon(labelPolygon: ILabelShape): void {
      const { label2color, editable, shapeName } = this;
      const layer = this.getLayer();
      const points = labelPolygon.position as [number, number][];
      const { category, uuid } = labelPolygon;

      const editablePolygon = new EditablePolygon(points, editable);
      const group = editablePolygon.getNode()
        .name(shapeName)
        .setAttr('object', editablePolygon)
        .setAttr('uuid', uuid);
      editablePolygon.getPolygon()
        .stroke(label2color(category));
      editablePolygon.setOnUpdatePosition((d: EditablePolygon) => {
        this.$emit('update:shape', {
          category,
          shape: ObjectShapeType.Polygon,
          position: d.points(),
          uuid,
        });
      });
      editablePolygon.setOnClick(() => {
        this.$emit('update:selected-shapes', [uuid]);
      });
      layer.add(group);
    },
    drawEditableShapes(): void {
      const { labelShapes } = this;
      const layer = this.getLayer();

      // clean layer
      layer.destroyChildren();
      if (labelShapes !== null) {
        labelShapes.forEach((d: ILabelShape) => {
          if (d.shape === ObjectShapeType.Point) {
            this.drawEditableCircle(d);
          } else if (d.shape === ObjectShapeType.Rect) {
            this.drawEditableRect(d);
          } else if (d.shape === ObjectShapeType.Polygon) {
            this.drawEditablePolygon(d);
          }
        });
      }
      this.drawEditState();
    },
  },
});
</script>

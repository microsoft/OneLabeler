<template>
  <div style="display: flex">
    <!-- stroke shape menu -->
    <VStrokeShapeMenu
      :stroke-shape="strokeShape"
      :disabled="mouseOperation !== MouseOperationType.PaintBrush
        && mouseOperation !== MouseOperationType.PaintErase"
      @set:stroke-shape="onSetStrokeShape"
    />

    <v-divider
      class="mx-2"
      vertical
    />

    <!-- stroke width menu -->
    <VStrokeWidthMenu
      :stroke-width="strokeWidth"
      :disabled="mouseOperation !== MouseOperationType.PaintBrush
        && mouseOperation !== MouseOperationType.PaintErase"
      @set:stroke-width="onSetStrokeWidth"
    />

    <v-divider
      class="mx-2"
      vertical
    />

    <!-- stroke color menu -->
    <VStrokeColorMenu
      :classes="classes"
      :stroke-label="strokeLabel"
      :label2color="label2color"
      :disabled="mouseOperation === MouseOperationType.PanAndZoom
        || mouseOperation === MouseOperationType.EditShape
        || mouseOperation === MouseOperationType.PaintErase"
      @set:stroke-label="onSetStrokeLabel"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Category, ILabelCategory } from '@/commons/types';
import VStrokeShapeMenu from './VStrokeShapeMenu.vue';
import VStrokeWidthMenu from './VStrokeWidthMenu.vue';
import VStrokeColorMenu from './VStrokeColorMenu.vue';

export enum MouseOperationType {
  PanAndZoom = 'PanAndZoom',
  PaintBrush = 'PaintBrush',
  PaintErase = 'PaintErase',
  EditShape = 'EditShape',
}

export enum StrokeShapeType {
  Circle = 'Circle',
  Square = 'Square',
}

export default Vue.extend({
  name: 'VSingleTool',
  components: {
    VStrokeShapeMenu,
    VStrokeWidthMenu,
    VStrokeColorMenu,
  },
  props: {
    classes: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    mouseOperation: {
      type: String as PropType<MouseOperationType | string>,
      required: true,
    },
    strokeLabel: {
      type: String as PropType<ILabelCategory | null>,
      default: null,
    },
    strokeShape: {
      type: String as PropType<StrokeShapeType>,
      required: true,
    },
    strokeWidth: {
      type: Number as PropType<number>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  data() {
    return { MouseOperationType };
  },
  methods: {
    onSetStrokeShape(strokeShape: StrokeShapeType): void {
      this.$emit('set:stroke-shape', strokeShape);
    },
    onSetStrokeWidth(strokeWidth: number): void {
      this.$emit('set:stroke-width', strokeWidth);
    },
    onSetStrokeLabel(strokeLabel: Category): void {
      this.$emit('set:stroke-label', strokeLabel);
    },
  },
});
</script>

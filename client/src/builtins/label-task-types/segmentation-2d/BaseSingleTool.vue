<template>
  <div style="display: flex">
    <!-- stroke shape menu -->
    <VStrokeShapeMenu
      :stroke-shape="strokeShape"
      :disabled="mouseOperation !== MouseOperationType.PaintBrush
        && mouseOperation !== MouseOperationType.PaintErase"
      @set:stroke-shape="$emit('set:stroke-shape', $event)"
    />

    <v-divider
      class="mx-1"
      vertical
    />

    <!-- stroke width menu -->
    <VStrokeWidthMenu
      :stroke-width="strokeWidth"
      :disabled="mouseOperation !== MouseOperationType.PaintBrush
        && mouseOperation !== MouseOperationType.PaintErase"
      @set:stroke-width="$emit('set:stroke-width', $event)"
    />

    <v-divider
      class="mx-1"
      vertical
    />

    <!-- stroke color menu -->
    <VStrokeColorMenu
      :categories="categories"
      :stroke-label="strokeLabel"
      :label2color="label2color"
      :disabled="mouseOperation === MouseOperationType.PanAndZoom
        || mouseOperation === MouseOperationType.EditShape
        || mouseOperation === MouseOperationType.PaintErase"
      @set:stroke-label="$emit('set:stroke-label', $event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { Category, ILabelCategory } from '@/commons/types';
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

export default defineComponent({
  name: 'BaseSingleTool',
  components: {
    VStrokeShapeMenu,
    VStrokeWidthMenu,
    VStrokeColorMenu,
  },
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
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
  },
  emits: {
    'set:stroke-shape': null,
    'set:stroke-width': null,
    'set:stroke-label': null,
  },
  data() {
    return { MouseOperationType };
  },
});
</script>

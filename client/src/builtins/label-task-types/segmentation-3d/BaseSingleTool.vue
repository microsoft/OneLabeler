<template>
  <!-- stroke color menu -->
  <VStrokeColorMenu
    :categories="categories"
    :stroke-category="strokeCategory"
    :label2color="label2color"
    :disabled="mouseOperation !== MouseOperationType.PaintBrush"
    @set:stroke-category="$emit('upsert:toolbar-state', { strokeCategory: $event })"
  />
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { Category } from '@/commons/types';
import VStrokeColorMenu from './VStrokeColorMenu.vue';
import { MouseOperationType } from './types';
import type { ToolbarState } from './types';

export default {
  name: 'BaseSingleTool',
  components: { VStrokeColorMenu },
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    toolbarState: {
      type: Object as PropType<ToolbarState>,
      default: null,
    },
  },
  data() {
    return { MouseOperationType };
  },
  computed: {
    mouseOperation(): MouseOperationType | string | null {
      return this.toolbarState?.mouseOperation ?? null;
    },
    strokeCategory(): MouseOperationType | string | null {
      return this.toolbarState?.strokeCategory ?? null;
    },
  },
};
</script>

<template>
  <v-btn-toggle
    :value="mouseOperationIndex"
    :mandatory="mouseOperationIndex !== null"
    class="view-header-button-toggle"
  >
    <v-btn
      v-for="btn in mouseOperationButtons"
      :key="btn.mouseOperation"
      :title="btn.title"
      :disabled="btn.disabled"
      class="px-1"
      icon
      x-small
      @click="$emit('upsert:toolbar-state', { mouseOperation: btn.mouseOperation })"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        {{ btn.icon }}
      </v-icon>
    </v-btn>
  </v-btn-toggle>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { LabelTaskType } from '@/commons/types';
import type { Category } from '@/commons/types';
import { MouseOperationType } from './types';
import type { ToolbarState } from './types';

export default defineComponent({
  name: 'TheHeaderModeToggle',
  props: {
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
      required: true,
    },
    toolbarState: {
      type: Object as PropType<ToolbarState>,
      default: null,
    },
  },
  emits: {
    'upsert:toolbar-state': null,
  },
  computed: {
    mouseOperation(): MouseOperationType | null {
      return this.toolbarState?.mouseOperation ?? null;
    },
    mouseOperationButtons() {
      const { labelTasks } = this;

      const pan = {
        title: 'pan & zoom',
        icon: this.$vuetify.icons.values.pan,
        mouseOperation: MouseOperationType.PanAndZoom,
        disabled: false,
      };
      const paint = {
        title: 'paint',
        icon: this.$vuetify.icons.values.paint,
        mouseOperation: MouseOperationType.PaintBrush,
        disabled: this.filterCategories(LabelTaskType.Segmentation3d).length === 0,
      };
      const erase = {
        title: 'eraser',
        icon: this.$vuetify.icons.values.eraser,
        mouseOperation: MouseOperationType.PaintErase,
        disabled: this.filterCategories(LabelTaskType.Segmentation3d).length === 0,
      };
      return [
        pan,
        ...labelTasks.includes(LabelTaskType.Segmentation3d) ? [paint, erase] : [],
      ];
    },
    mouseOperationIndex(): number | null {
      const { mouseOperation, mouseOperationButtons } = this;
      const index = mouseOperationButtons
        .findIndex((d) => d.mouseOperation === mouseOperation);
      if (index === -1) return null;
      return index;
    },
  },
  mounted() {
    // If mouse operation not set, set it to PanAndZoom as default.
    if (this.mouseOperation === null) {
      this.$emit('upsert:toolbar-state', { mouseOperation: MouseOperationType.PanAndZoom });
    }
  },
  methods: {
    filterCategories(labelTask: LabelTaskType): Category[] {
      const { categoryTasks } = this;
      const categoriesFiltered: Category[] = Object.entries(categoryTasks)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([category, usedInTasks]) => (
          usedInTasks === null || usedInTasks.includes(labelTask)
        )).map((d) => d[0]);
      return categoriesFiltered;
    },
  },
});
</script>

<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <v-btn-toggle
    :value="mouseOperationIndex"
    :mandatory="mouseOperationIndex !== null"
    class="card-header-button-toggle"
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

type MouseOperationButton = {
  title: string;
  icon: string;
  mouseOperation: MouseOperationType;
  disabled: boolean;
}

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
    mouseOperationButtons(): MouseOperationButton[] {
      const { labelTasks } = this;

      const pan = {
        title: 'pan & zoom',
        icon: this.$vuetify.icons.values.pan as string,
        mouseOperation: MouseOperationType.PanAndZoom,
        disabled: false,
      };
      const paint = {
        title: 'paint',
        icon: this.$vuetify.icons.values.paint as string,
        mouseOperation: MouseOperationType.PaintBrush,
        disabled: this.filterCategories(LabelTaskType.Segmentation3d).length === 0,
      };
      const erase = {
        title: 'eraser',
        icon: this.$vuetify.icons.values.eraser as string,
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
        .filter(([, usedInTasks]) => (
          usedInTasks === null || usedInTasks.includes(labelTask)
        )).map((d) => d[0]);
      return categoriesFiltered;
    },
  },
});
</script>

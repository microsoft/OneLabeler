<template>
  <div style="display: flex; gap: 4px;">
    <v-btn
      v-for="category in categories"
      :key="category"
      class="card-header-button subtitle-2 elevation-0 text-none"
      :class="{ 'white--text': isCategorySelected(category) }"
      :style="{
        'border-color': '#bbb',
        'background-color': isCategorySelected(category)
          ? label2color(category)
          : undefined,
      }"
      x-small
      outlined
      @click="onSetStrokeCategory(category)"
    >
      {{ category }}
      <v-icon
        class="pl-2"
        aria-hidden="true"
        small
        :style="{ color: label2color(category) }"
      >
        $vuetify.icons.values.square
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { Category } from '@/commons/types';
import type { ToolbarState } from './types';

export default defineComponent({
  name: 'BaseSingleTool',
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
  emits: {
    'upsert:toolbar-state': null,
  },
  computed: {
    strokeCategory(): Category | string | null {
      return this.toolbarState?.strokeCategory ?? null;
    },
  },
  mounted() {
    if (this.strokeCategory === null && this.categories.length !== 0) {
      this.$emit('upsert:toolbar-state', {
        strokeCategory: this.categories[0],
      } as Partial<ToolbarState>);
    }
  },
  methods: {
    onSetStrokeCategory(category: Category): void {
      const brush = category === this.strokeCategory ? null : category;
      this.$emit('upsert:toolbar-state', {
        strokeCategory: brush,
      } as Partial<ToolbarState>);
    },
    isCategorySelected(category: Category): boolean {
      return this.strokeCategory === category;
    },
  },
});
</script>

<template>
  <div style="display: flex">
    <v-btn
      v-for="(category, i) in categories"
      :key="category"
      class="view-header-button subtitle-2 elevation-0 text-none"
      :class="{
        'white--text': isCategorySelected(category),
        'ml-1': i !== 0,
      }"
      :style="{
        'border-color': '#bbb',
        'background-color': isCategorySelected(category)
          ? label2color(category)
          : undefined,
      }"
      x-small
      outlined
      @click="onSetBrushCategory(category)"
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
import Vue, { PropType } from 'vue';
import { Category } from '@/commons/types';

export default Vue.extend({
  name: 'VSingleTool',
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    brushCategory: {
      type: String as PropType<Category | null>,
      default: null,
    },
  },
  methods: {
    onSetBrushCategory(category: Category): void {
      const brush = category === this.brushCategory ? null : category;
      // TODO: make the component emit unified message format used by all the label tasks
      this.$emit('set:brush-category', brush);
    },
    isCategorySelected(category: Category): boolean {
      return this.brushCategory === category;
    },
  },
});
</script>

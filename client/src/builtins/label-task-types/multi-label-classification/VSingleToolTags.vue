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
          ? '#bbb'
          : undefined,
      }"
      x-small
      outlined
      @click="onClickLabelCategory(category)"
    >
      {{ category }}
      <v-icon
        class="pl-2"
        aria-hidden="true"
        small
        style="color: #bbb"
      >
        $vuetify.icons.values.square
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  ILabelMultiCategory,
} from '@/commons/types';

export default Vue.extend({
  name: 'VSingleTool',
  props: {
    labelMultiCategory: {
      type: Array as PropType<ILabelMultiCategory | null>,
      default: null,
    },
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onClickLabelCategory(category: Category): void {
      const { labelMultiCategory } = this;
      if (labelMultiCategory === null) {
        this.$emit('set:label-multi-category', [category]);
        return;
      }
      const idx = labelMultiCategory.findIndex((d) => d === category);
      const newValue: ILabelMultiCategory = idx >= 0
        ? [...labelMultiCategory.slice(0, idx), ...labelMultiCategory.slice(idx + 1)]
        : [...labelMultiCategory, category];
      this.$emit('set:label-multi-category', newValue);
    },
    isCategorySelected(category: Category): boolean {
      return this.labelMultiCategory?.includes(category) ?? false;
    },
  },
});
</script>

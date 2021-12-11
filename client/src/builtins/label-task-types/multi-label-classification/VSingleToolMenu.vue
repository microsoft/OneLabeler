<template>
  <!-- The data object label menu. -->
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        :disabled="disabled"
        class="card-header-button subtitle-2 text-none"
        x-small
        v-on="on"
      >
        Multi-Label
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(category, i) in categories"
        :key="i"
        class="subtitle-2 pr-4 pl-2"
        style="min-height: 30px"
        @click.stop="onClickCategory(category)"
      >
        <v-checkbox
          :value="isCategorySelected(category)"
          :input-value="isCategorySelected(category)"
          class="py-0 ma-0"
          dense
          hide-details
        />
        {{ category }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { Category, ILabelMultiCategory } from '@/commons/types';

export default defineComponent({
  name: 'VSingleToolMenu',
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
  emits: {
    'set:label-multi-category': null,
  },
  methods: {
    onClickCategory(category: Category): void {
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

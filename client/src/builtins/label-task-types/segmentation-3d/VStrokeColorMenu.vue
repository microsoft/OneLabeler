<template>
  <v-menu
    v-if="strokeCategory !== null"
    offset-y
  >
    <template #activator="{ on }">
      <v-btn
        :disabled="disabled"
        width="85"
        class="card-header-button subtitle-2 pl-1 text-none"
        title="Set Stroke Color"
        x-small
        v-on="on"
      >
        {{ strokeCategory }}
        <v-spacer />
        <v-icon
          aria-hidden="true"
          small
          :style="{ color: label2color(strokeCategory) }"
        >
          $vuetify.icons.values.square
        </v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="category in categories"
        :key="category"
        class="subtitle-2"
        style="min-height: 30px"
        @click="$emit('set:stroke-category', category)"
      >
        {{ category }}
        <div style="flex-grow: 1" />
        <v-icon
          class="pl-1"
          style="float: right"
          aria-hidden="true"
          small
          :style="{ color: label2color(category) }"
        >
          $vuetify.icons.values.square
        </v-icon>
      </v-list-item>
    </v-list>
  </v-menu>
  <v-btn
    v-else
    class="card-header-button subtitle-2"
    width="85"
    title="Set Stroke Color"
    x-small
    disabled
    icon
  >
    Color
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { Category } from '@/commons/types';

export default defineComponent({
  name: 'VStrokeColorMenu',
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    strokeCategory: {
      type: String as PropType<Category | null>,
      default: null,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  emits: {
    'set:stroke-category': null,
  },
  watch: {
    categories(newValue: Category[], oldValue: Category[]): void {
      // When the first category is added to categories,
      // select it as the default stroke category.
      if (oldValue.length === 0 && newValue.length !== 0) {
        this.$emit('set:stroke-category', newValue[0]);
      }
    },
  },
  mounted() {
    // If categories is not empty while no stroke category is selected,
    // select the first category as the default stroke category.
    const { categories, strokeCategory } = this;
    if (strokeCategory === null && categories.length !== 0) {
      this.$emit('set:stroke-category', categories[0]);
    }
  },
});
</script>

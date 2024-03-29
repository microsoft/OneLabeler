<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <component
    :is="element"
    :label-multi-category="labelMultiCategory"
    :categories="categories"
    :label2color="label2color"
    :disabled="disabled"
    @upsert:labels="$emit('upsert:labels', $event)"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { VueConstructor } from 'vue';
import type { Category, ILabel, ILabelMultiCategory } from '@/commons/types';
import VSingleToolMenu from './VSingleToolMenu.vue';
import VSingleToolTags from './VSingleToolTags.vue';

enum SelectorUI {
  Menu = 'Menu',
  Tags = 'Tags',
}

export default defineComponent({
  name: 'BaseSingleTool',
  props: {
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    component: {
      type: String as PropType<SelectorUI>,
      default: SelectorUI.Tags,
    },
  },
  emits: {
    'upsert:labels': null,
  },
  computed: {
    element(): VueConstructor {
      if (this.component === SelectorUI.Menu) return VSingleToolMenu;
      if (this.component === SelectorUI.Tags) return VSingleToolTags;
      throw new TypeError(`Invalid component type ${this.component}`);
    },
    labelMultiCategory(): ILabelMultiCategory | null {
      const { label } = this;
      return label?.multiCategory ?? null;
    },
  },
});
</script>

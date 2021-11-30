<template>
  <component
    :is="element"
    :label-multi-category="labelMultiCategory"
    :categories="categories"
    :disabled="disabled"
    @set:label-multi-category="$emit('upsert:label', { multiCategory: $event })"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { VueConstructor } from 'vue';
import type { Category, ILabel, ILabelMultiCategory } from '@/commons/types';
import VSingleToolMenu from './VSingleToolMenu.vue';
import VSingleToolTags from './VSingleToolTags.vue';

enum Component {
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
    disabled: {
      type: Boolean,
      default: false,
    },
    component: {
      type: String as PropType<Component>,
      default: Component.Tags,
    },
  },
  emits: {
    'upsert:label': null,
  },
  computed: {
    element(): VueConstructor {
      const mapper: Record<Component, VueConstructor> = {
        [Component.Menu]: VSingleToolMenu,
        [Component.Tags]: VSingleToolTags,
      };
      return mapper[this.component];
    },
    labelMultiCategory(): ILabelMultiCategory | null {
      const { label } = this;
      return label?.multiCategory ?? null;
    },
  },
});
</script>

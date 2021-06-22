<template>
  <component
    :is="element"
    :label-multi-category="labelMultiCategory"
    :classes="classes"
    :disabled="disabled"
    @set:label-multi-category="onSetLabelMultiCategory"
  />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  ILabelMultiCategory,
} from '@/commons/types';
import VSingleToolMenu from './VSingleToolMenu.vue';
import VSingleToolTags from './VSingleToolTags.vue';

enum Component {
  Menu = 'Menu',
  Tags = 'Tags',
}

export default Vue.extend({
  name: 'VSingleTool',
  props: {
    labelMultiCategory: {
      type: Array as PropType<ILabelMultiCategory | null>,
      default: null,
    },
    classes: {
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
  computed: {
    element() {
      const mapper: Record<Component, Vue.VueConstructor> = {
        [Component.Menu]: VSingleToolMenu,
        [Component.Tags]: VSingleToolTags,
      };
      return mapper[this.component];
    },
  },
  methods: {
    onSetLabelMultiCategory(newValue: ILabelMultiCategory): void {
      this.$emit('set:label-multi-category', newValue);
    },
  },
});
</script>

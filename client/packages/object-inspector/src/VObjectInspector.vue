<template>
  <div
    :class="[
      'vue-object-inspector',
      darkTheme ? 'vue-object-inspector-chromedark' : '',
    ]"
  >
    <VTreeView
      v-bind="$attrs"
      :data="data"
      :name="name"
      :expand-level="expandLevel"
      :expand-paths="expandPaths"
      :data-iterator="dataIterator"
      :sort-object-keys="sortObjectKeys"
    />
  </div>
</template>

<script lang="tsx">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import './styles/index.scss';
import { createIterator } from './utils/data';
import type { CompareFunction, ObjectIterator } from './utils/data';
import VTreeView from './components/VTreeView.vue';

export default defineComponent({
  name: 'VObjectInspector',
  components: { VTreeView },
  provide() {
    return {
      objectMaxProperties: this.objectMaxProperties,
      arrayMaxProperties: this.arrayMaxProperties,
    };
  },
  props: {
    /** The JavaScript variable to inspect. */
    data: {
      // Any type.
      type: null,
      required: true,
    },
    /** The root variables prefix name. */
    name: {
      type: String as PropType<string>,
      default: null,
    },
    /** The depth level to which the tree should be initially expanded. */
    expandLevel: {
      type: Number as PropType<number>,
      default: 0,
    },
    /** The list of paths that should be initially expanded. */
    expandPaths: {
      type: Array as PropType<string[]>,
      default: null,
    },
    /** Whether to show non-enumerable properties (e.g., __proto__, length). */
    showNonEnumerable: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    /**
     * Whether to sort the object keys.
     * If true, sort keys in alphabetical order except for arrays.
     * If false, no sorting is applied
     * (the keys are ordered by Object.getOwnPropertyNames).
     * If a compare function is passed,
     * the keys are sorted by the compare function.
     */
    sortObjectKeys: {
      type: [Boolean, Function] as PropType<boolean | CompareFunction>,
      default: false,
    },
    /**
     * The max number of object properties shown in preview.
     * (The ones not in preview are abbreviated with ...)
     */
    objectMaxProperties: {
      type: Number as PropType<number>,
      default: 5,
    },
    /**
     * The max number of array properties shown in preview.
     * (The ones not in preview are abbreviated with ...)
     */
    arrayMaxProperties: {
      type: Number as PropType<number>,
      default: 10,
    },
    /** Whether to use dark theme or light theme. */
    darkTheme: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  computed: {
    /** A factory of object property iterators. */
    dataIterator(): ObjectIterator {
      return createIterator(this.showNonEnumerable, this.sortObjectKeys);
    },
  },
});
</script>

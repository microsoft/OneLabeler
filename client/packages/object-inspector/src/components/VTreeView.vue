<template>
  <ol
    role="tree"
    class="tree-view-outline"
  >
    <VConnectedTreeNode
      :data="data"
      :name="name"
      :data-iterator="dataIterator"
      :path="DEFAULT_ROOT_PATH"
      :depth="0"
      :is-non-enumerable="false"
      :expanded-paths="expandedPaths"
      @update:expanded-paths="onUpdateExpandedPaths"
    />
  </ol>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import VConnectedTreeNode from './VConnectedTreeNode.vue';
import { DEFAULT_ROOT_PATH, getExpandedPaths } from '../utils/path';
import type { CompareFunction, ObjectIterator } from '../utils/data';

export default defineComponent({
  name: 'VTreeView',
  components: { VConnectedTreeNode },
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
    /** A factory of object property iterators. */
    dataIterator: {
      type: Function as PropType<ObjectIterator>,
      required: true,
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
  },
  data() {
    return {
      DEFAULT_ROOT_PATH,
      // The list of paths currently expanded.
      expandedPaths: {},
    };
  },
  watch: {
    expandLevel() {
      this.updateByExpandLevel([]);
    },
    expandPaths() {
      this.updateByExpandPaths();
    },
  },
  beforeMount(): void {
    this.updateExpandedPaths();
  },
  methods: {
    /** Update expanded paths by the expandPaths and expandLevel parameters. */
    updateExpandedPaths(): void {
      const paths = this.updateByExpandPaths();
      this.updateByExpandLevel(paths);
    },
    /** Update expanded paths by the expandPaths parameters. */
    updateByExpandPaths(): string[] {
      const paths: string[] = [];
      if (this.expandPaths !== null) {
        this.expandPaths.forEach((path: string) => {
          const arr = path.split('.');
          arr.forEach((part, index) => {
            paths.push(arr.slice(0, index + 1).join('.'));
          });
        });
      }
      this.expandedPaths = getExpandedPaths(
        this.data,
        this.dataIterator,
        paths,
        0,
        {},
      );

      return paths;
    },
    /** Update expanded paths by the expandLevel parameters. */
    updateByExpandLevel(paths: string[]): void {
      this.expandedPaths = getExpandedPaths(
        this.data,
        this.dataIterator,
        paths,
        this.expandLevel,
        {},
      );
    },
    /** When user interaction triggers update of expanded paths. */
    onUpdateExpandedPaths(
      { path, val }: { path: string, val: boolean },
    ): void {
      this.$set(this.expandedPaths, path, val);
    },
  },
});
</script>

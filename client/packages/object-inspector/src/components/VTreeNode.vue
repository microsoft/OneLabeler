<template>
  <li
    :aria-expanded="expanded"
    role="treeitem"
    class="tree-node"
  >
    <div
      class="tree-node-preview-container"
      @click="$emit('toggle:expand')"
    >
      <span
        v-if="showArrow"
        :class="[
          'tree-node-arrow',
          expanded ? 'tree-node-arrow-expanded' : 'tree-node-arrow-collapsed',
        ]"
      >
        ▶
      </span>
      <!-- Pad a placeholder to make variable attributes indented. -->
      <span
        v-else-if="showPlaceholder && $slots.default"
        class="tree-node-placeholder"
      >&nbsp;</span>
      <VObjectRootLabel
        v-if="depth === 0"
        :name="name"
        :data="data"
      />
      <VObjectLabel
        v-else
        :name="name"
        :data="data"
        :is-non-enumerable="isNonEnumerable"
      />
    </div>

    <ol
      role="group"
      class="tree-node-child-nodes-container"
    >
      <!-- The slot to accommodate child nodes. -->
      <slot v-if="expanded" />
    </ol>
  </li>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import VObjectLabel from './VObjectLabel.vue';
import VObjectRootLabel from './VObjectRootLabel.vue';

export default defineComponent({
  name: 'VTreeNode',
  components: {
    VObjectLabel,
    VObjectRootLabel,
  },
  props: {
    /** The JavaScript variable to inspect. */
    data: {
      // Any type.
      type: null,
      required: true,
    },
    /** The variable name. */
    name: {
      type: String as PropType<string>,
      default: null,
    },
    /**
     * The depth of the variable.
     * (Root variable has depth 0)
     */
    depth: {
      type: Number as PropType<number>,
      required: true,
    },
    /** Whether the variable is non-enumerable. */
    isNonEnumerable: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    /** Whether the variable should be expanded. */
    expanded: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    /** Whether to show an arrow for expand interaction. */
    showArrow: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    /**
     * Whether to pad a placeholder on the left.
     * The placeholder makes variable attributes look indented.
     */
    showPlaceholder: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
  },
  emits: {
    'toggle:expand': null,
  },
});
</script>

<template>
  <span :title="name">
    <span
      v-if="typeof name === 'string'"
      :class="['object-name', isNonEnumerable ? 'object-name-dimmed' : '']"
    >{{ name }}</span>
    <VObjectPreview
      v-else
      :data="name"
    />
    <span>: </span>
    <VObjectValue :object="data" />
  </span>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import VObjectPreview from './VObjectPreview.vue';
import VObjectValue from './VObjectValue.vue';

export default defineComponent({
  name: 'VObjectLabel',
  components: {
    VObjectValue,
    VObjectPreview,
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
    /** Whether the variable is non-enumerable. */
    isNonEnumerable: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
  },
});
</script>

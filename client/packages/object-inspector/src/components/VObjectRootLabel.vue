<template>
  <span>
    <span v-if="typeof name === 'string'">
      <span class="object-name">{{ name }}</span>
      <span>: </span>
      <VObjectPreview :data="data" />
    </span>
    <VObjectPreview
      v-else
      :data="data"
    />
  </span>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import VObjectPreview from './VObjectPreview.vue';

export default defineComponent({
  name: 'VObjectRootLabel',
  components: { VObjectPreview },
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
  },
});
</script>

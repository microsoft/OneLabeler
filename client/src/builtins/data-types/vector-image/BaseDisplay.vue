<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="dataObject.html" />
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from '@vue/composition-api';
import { IVectorImage } from '@/commons/types';

export default defineComponent({
  name: 'BaseDisplay',
  props: {
    /** The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IVectorImage>,
      required: true,
    },
  },
});
</script>

<template>
  <iframe :src="dataObject.content" />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { IWebpage } from '@/commons/types';

export default Vue.extend({
  name: 'VDisplay',
  props: {
    /** The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IWebpage>,
      required: true,
    },
  },
});
</script>

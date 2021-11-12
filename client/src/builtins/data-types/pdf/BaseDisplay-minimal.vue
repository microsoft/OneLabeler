<template>
  <iframe :src="dataObject.content" />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { IPdf } from '@/commons/types';

export default Vue.extend({
  name: 'BaseDisplay',
  props: {
    /** The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IPdf>,
      required: true,
    },
  },
});
</script>

<template>
  <iframe :src="dataObject.content" />
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { IPdf } from '@/commons/types';

export default {
  name: 'BaseDisplay',
  props: {
    /** The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IPdf>,
      required: true,
    },
  },
};
</script>

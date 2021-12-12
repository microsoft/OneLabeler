<template>
  <iframe :src="dataObject.content" />
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { IDataObject } from './index';

export default {
  name: 'BaseDisplay',
  props: {
    /** The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IDataObject>,
      required: true,
    },
  },
};
</script>

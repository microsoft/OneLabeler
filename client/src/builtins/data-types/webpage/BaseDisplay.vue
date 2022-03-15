<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <iframe :src="dataObject.content" />
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { IWebpage } from '@/commons/types';

export default {
  name: 'BaseDisplay',
  props: {
    /** The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IWebpage>,
      required: true,
    },
  },
};
</script>

<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div>
    Replace this sentence with your custom implementation
  </div>
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

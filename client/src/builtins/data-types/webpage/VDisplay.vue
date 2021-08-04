<template>
  <iframe
    :width="width"
    :height="height"
    :src="dataObject.content"
  />
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
    /** The width of the svg as a number or string of form '...%'. */
    width: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
    /** The height of the svg as a number or string of form '...%'. */
    height: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
  },
});
</script>

<template>
  <div
    :style="{
      'width': `${width}px`,
      'height': `${height}px`,
      'overflow-y': 'scroll',
      'font-size': '24px',
      'line-height': 'initial',
    }"
  >
    {{ dataObject.content }}
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { IText } from '@/commons/types';

export default Vue.extend({
  name: 'VDisplayText',
  props: {
    /**
     * @description The data object to be rendered.
     */
    dataObject: {
      type: Object as PropType<IText>,
      required: true,
    },
    /**
     * @description The width of the svg as a number or string of form '...%'
     */
    width: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
    /**
     * @description The height of the svg as a number or string of form '...%'
     */
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

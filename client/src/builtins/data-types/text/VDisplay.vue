<template>
  <div
    ref="textElement"
    :style="{
      'width': widthStr,
      'height': heightStr,
      'overflow-y': 'scroll',
      'font-size': '24px',
      'line-height': 'initial',
    }"
    @scroll="onScroll"
  >
    {{ dataObject.content }}
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { IText } from '@/commons/types';

export default Vue.extend({
  name: 'VDisplay',
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
  computed: {
    widthStr(): string {
      const { width } = this;
      if (typeof width === 'number') return `${width}px`;
      return width;
    },
    heightStr(): string {
      const { height } = this;
      if (typeof height === 'number') return `${height}px`;
      return height;
    },
  },
  methods: {
    /** Get the text node (needed by span annotation). */
    getTextNode(): Text {
      const textElement = this.$refs.textElement as HTMLElement;
      const textNode = textElement.childNodes[0] as Text;
      return textNode;
    },
    onScroll(e: MouseEvent): void {
      this.$emit('scroll', e);
    },
  },
});
</script>

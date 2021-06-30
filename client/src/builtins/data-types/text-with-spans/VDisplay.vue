<template>
  <div
    :style="{
      width: widthStr,
      height: heightStr,
      'overflow-y': 'scroll',
      'font-size': '24px',
      'line-height': 'initial',
    }"
    @scroll="onScroll"
  >
    <div>
      <div
        class="px-2"
        style="flex: 1 1 auto;"
      >
        <!-- Note: don't use linebreak between the text,
          otherwise a white space will be added -->
        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
        <p ref="textElement">{{ dataObject.content }}</p>
      </div>
    </div>
    <v-divider class="pb-4" />
    <VStructure
      :data-object="dataObject"
      :label="label"
      :label2color="label2color"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { IText, ILabel } from '@/commons/types';
import VStructure from './VStructure/VStructure.vue';

export default Vue.extend({
  name: 'VDisplay',
  components: { VStructure },
  props: {
    /**
     * @description The data object to be rendered.
     */
    dataObject: {
      type: Object as PropType<IText>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
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

<template>
  <div
    class="data-object-container"
    @scroll="$emit('scroll', $event)"
  >
    <!-- Note: don't use linebreak between the text,
      otherwise a white space will be added -->
    <!-- eslint-disable vue/singleline-html-element-content-newline -->
    <p
      ref="textElement"
      class="data-object-content"
    >{{ dataObject.content }}</p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { IText } from '@/commons/types';

export default Vue.extend({
  name: 'VDisplay',
  props: {
    /**  The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IText>,
      required: true,
    },
  },
  methods: {
    /** Get the text node (needed by span annotation). */
    getTextNode(): Text {
      const textElement = this.$refs.textElement as HTMLElement;
      const textNode = textElement.childNodes[0] as Text;
      return textNode;
    },
  },
});
</script>

<style scoped>
.data-object-container {
  position: relative;
  overflow-y: auto;
  line-height: initial;
  font-size: 24px;
}

.data-object-content {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>

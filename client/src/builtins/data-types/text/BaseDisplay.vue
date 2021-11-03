<template>
  <div style="display: grid">
    <!-- Expose getTextNode and getEventNode to label task overlay. -->
    <slot
      name="overlay"
      :get-text-node="getTextNode"
      :get-event-node="getEventNode"
    />
    <div
      ref="medium"
      class="data-object-container"
      style="grid-area: 1 / 1 / 2 / 2"
    >
      <!-- Note: don't use linebreak between the text,
        otherwise a white space will be added -->
      <!-- eslint-disable vue/singleline-html-element-content-newline -->
      <p
        ref="text"
        class="data-object-content"
      >{{ dataObject.content }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { IText } from '@/commons/types';

export default Vue.extend({
  name: 'BaseDisplay',
  props: {
    /**  The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IText>,
      required: true,
    },
  },
  methods: {
    /**
     * Get the node that contains the text.
     * Needed by span annotation.
     */
    getTextNode(): Text {
      const element = this.$refs.text as HTMLElement;
      const node = [...element.childNodes]
        .find((d) => d.nodeType === Node.TEXT_NODE) as Text | undefined;
      if (node === undefined) throw Error('Text node inexist.');
      return node;
    },
    /**
     * Get the node on which interaction events are triggered.
     * Needed by span annotation.
     */
    getEventNode(): HTMLElement {
      return this.$refs.medium as HTMLElement;
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

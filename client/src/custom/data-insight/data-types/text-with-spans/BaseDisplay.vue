<template>
  <div
    :style="{
      'overflow-y': 'scroll',
      'font-size': '24px',
      'line-height': 'initial',
    }"
    @scroll="$emit('scroll', $event)"
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
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { IText, ILabel } from '@/commons/types';
import VStructure from './VStructure/VStructure.vue';

export default defineComponent({
  name: 'BaseDisplay',
  components: { VStructure },
  props: {
    /** @description The data object to be rendered. */
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
  },
  emits: {
    scroll: null,
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

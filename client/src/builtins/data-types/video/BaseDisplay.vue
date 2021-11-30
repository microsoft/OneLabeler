<template>
  <VMedia
    ref="media"
    component="video"
    :src="dataObject.content"
    @timeupdate="$emit('timeupdate', $event)"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { ComponentInstance, PropType } from '@vue/composition-api';
import type { IVideo } from '@/commons/types';
import VMedia from './VMedia.vue';

export default defineComponent({
  name: 'BaseDisplay',
  components: { VMedia },
  props: {
    // The data object to be rendered.
    dataObject: {
      type: Object as PropType<IVideo>,
      required: true,
    },
  },
  emits: {
    timeupdate: null,
  },
  methods: {
    getMedia(): HTMLMediaElement {
      const component = this.$refs.media as ComponentInstance & {
        getMedia: () => HTMLMediaElement,
      };
      return component.getMedia();
    },
    getProgress(): HTMLProgressElement {
      const component = this.$refs.media as ComponentInstance & {
        getProgress: () => HTMLProgressElement,
      };
      return component.getProgress();
    },
  },
});
</script>

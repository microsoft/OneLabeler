<template>
  <VMedia
    ref="media"
    component="youtube-video"
    :src="dataObject.content"
    @timeupdate="$emit('timeupdate', $event)"
    @loadedmetadata="$emit('loadedmetadata', $event)"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { ComponentInstance, PropType } from '@vue/composition-api';
import type { IVideo } from '@/commons/types';
import VMedia from '../video/VMedia.vue';
import YoutubeVideoElement from './youtube-video';

if (customElements.get('youtube-video') === undefined) {
  customElements.define('youtube-video', YoutubeVideoElement);
}

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
    loadedmetadata: null,
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

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
import Vue, { PropType } from 'vue';
import { IVideo } from '@/commons/types';
import VMedia from '../video/VMedia.vue';
import YoutubeVideoElement from './youtube-video';

if (customElements.get('youtube-video') === undefined) {
  customElements.define('youtube-video', YoutubeVideoElement);
}

export default Vue.extend({
  name: 'VDisplay',
  components: { VMedia },
  props: {
    // The data object to be rendered.
    dataObject: {
      type: Object as PropType<IVideo>,
      required: true,
    },
  },
  methods: {
    getMedia(): HTMLMediaElement {
      const component = this.$refs.media as Vue & {
        getMedia: () => HTMLMediaElement,
      };
      return component.getMedia();
    },
    getProgress(): HTMLProgressElement {
      const component = this.$refs.media as Vue & {
        getProgress: () => HTMLProgressElement,
      };
      return component.getProgress();
    },
  },
});
</script>

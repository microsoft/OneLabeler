<template>
  <VMedia
    ref="media"
    component="youtube-video"
    :src="dataObject.content"
    :width="width"
    :height="height"
    @timeupdate="onTimeUpdate"
    @loadedmetadata="onLoadedMetadata"
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
    // The width of the component as a number or string of form '...%'.
    width: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
    // The height of the component as a number or string of form '...%'.
    height: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
  },
  mounted() {
    const media = this.getMedia();
    media.volume = 0.2;
  },
  methods: {
    onLoadedMetadata(e: Event): void {
      this.$emit('loadedmetadata', e);
    },
    onTimeUpdate(e: Event): void {
      this.$emit('timeupdate', e);
    },
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

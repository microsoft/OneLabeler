<template>
  <VMedia
    ref="media"
    component="video"
    :src="dataObject.content"
    @timeupdate="$emit('timeupdate', $event)"
  />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { IVideo } from '@/commons/types';
import VMedia from './VMedia.vue';

export default Vue.extend({
  name: 'BaseDisplay',
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

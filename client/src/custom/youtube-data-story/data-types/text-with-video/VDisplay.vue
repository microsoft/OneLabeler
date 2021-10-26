<template>
  <div style="display: flex; flex-direction: column; gap: 4px;">
    <VMedia
      ref="media"
      :key="dataObject.uuid"
      component="youtube-video"
      :src="dataObject.content.url"
      style="flex: 1 1 70%"
      @timeupdate="$emit('timeupdate', $event)"
      @loadedmetadata="onLoadedMetadata"
    />
    <div
      class="text-container"
      style="flex: 1 1 30%;"
      @scroll="$emit('scroll', $event)"
    >
      <!-- Note: don't use linebreak between the text,
        otherwise a white space will be added -->
      <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
      <p ref="textElement">{{ dataObject.content.text }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import VMedia from '@/builtins/data-types/video/VMedia.vue';
import YoutubeVideoElement from '@/builtins/data-types/youtube-video/youtube-video';

if (customElements.get('youtube-video') === undefined) {
  customElements.define('youtube-video', YoutubeVideoElement);
}

type ITextWithVideo = {
  uuid: string;
  content: {
    text: string;
    url: string;
    timestamp: number;
  };
}

export default Vue.extend({
  name: 'VDisplay',
  components: { VMedia },
  props: {
    /**
     * @description The data object to be rendered.
     */
    dataObject: {
      type: Object as PropType<ITextWithVideo>,
      required: true,
    },
  },
  methods: {
    onLoadedMetadata(e: Event): void {
      const media = this.getMedia();
      media.currentTime = this.dataObject.content.timestamp;
      this.$emit('loadedmetadata', e);
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
.text-container {
  overflow-y: scroll;
  font-size: 24px;
  line-height: initial;
}
</style>

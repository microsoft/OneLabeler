<template>
  <div
    :style="{
      'width': widthStr,
      'height': heightStr,
      'display': 'flex',
      'flex-direction': 'column',
    }"
  >
    <VMedia
      ref="media"
      component="youtube-video"
      :key="dataObject.uuid"
      :src="dataObject.content.url"
      :width="'100%'"
      :height="'70%'"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
    />
    <div
      ref="textElement"
      style="overflow-y: scroll; font-size: 24px; line-height: initial;"
      @scroll="onScroll"
    >
      {{ dataObject.content.text }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import VMedia from '../video/VMedia.vue';
import YoutubeVideoElement from '../youtube-video/youtube-video';

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
    onLoadedMetadata(e: Event): void {
      const media = this.getMedia();
      media.currentTime = this.dataObject.content.timestamp;
      this.$emit('loadedmetadata', e);
    },
    onScroll(e: MouseEvent): void {
      this.$emit('scroll', e);
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
    /** Get the text node (needed by span annotation). */
    getTextNode(): Text {
      const textElement = this.$refs.textElement as HTMLElement;
      const textNode = textElement.childNodes[0] as Text;
      return textNode;
    },
  },
});
</script>

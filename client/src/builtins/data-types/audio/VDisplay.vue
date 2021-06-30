<template>
  <div
    :style="{
      'width': widthStr,
      'height': heightStr,
      'display': 'flex',
      'flex-direction': 'column',
    }"
  >
    <div style="flex: 1 1 auto; display: flex; flex-direction: column;">
      <div ref="waveSpectrum" />
      <div
        ref="waveform"
        style="flex: 1 1 auto"
      />
    </div>
    <VMedia
      ref="media"
      component="audio"
      :src="dataObject.content"
      @timeupdate="onTimeUpdate"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import SpectrogramPlugin from 'wavesurfer.js/src/plugin/spectrogram';
import { IVideo } from '@/commons/types';
import VMedia from '../video/VMedia.vue';

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
  data() {
    return {
      wavesurfer: null as WaveSurfer | null,
    };
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
  mounted() {
    const media = this.getMedia();
    media.volume = 0.2;
    this.registerWaveSurfer();
  },
  methods: {
    onTimeUpdate(e: Event): void {
      this.$emit('timeupdate', e);
      if (this.wavesurfer === null) return;
      this.wavesurfer.setCurrentTime(this.getMedia().currentTime);
    },
    registerWaveSurfer(): void {
      const media = this.getMedia();

      // TODO: make the size of waveform and spectrogram responsive to the window size.
      const wavesurfer = WaveSurfer.create({
        height: 256,
        container: this.$refs.waveform as HTMLElement,
        plugins: [SpectrogramPlugin.create({
          container: this.$refs.waveSpectrum as HTMLElement,
          fftSamples: 1024,
        })],
      });
      wavesurfer.load(media);
      this.wavesurfer = wavesurfer;
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

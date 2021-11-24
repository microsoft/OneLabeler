<template>
  <!-- set tabindex=0 to make it focusable -->
  <div
    ref="container"
    tabindex="0"
    style="display: flex; flex-direction: column;"
  >
    <!-- The media element. -->
    <div
      class="media-container"
      style="flex: 1 1 auto"
    >
      <component
        :is="component"
        ref="media"
        :src="src"
        class="media-content"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
      />
    </div>

    <!-- The play controls. -->
    <VMediaControl
      ref="control"
      :current-time="currentTime"
      :duration="duration"
      :paused="paused"
      :muted="muted"
      :playback-rate="playbackRate"
      @set:paused="onSetPaused"
      @set:muted="onSetMuted"
      @set:playback-rate="onSetPlaybackRate"
      @set:current-time="onSetCurrentTime"
      @stop="onStop"
    />
  </div>
</template>

<script lang="ts">
import type { PropType, VueConstructor } from 'vue';
import VMediaControl from './VMediaControl.vue';

/**
 * Implementation note:
 * To make the media component to have responsive size,
 * set media component container to have position: relative,
 * and set media component to have position: absolute; width: 100%; height: 100%;.
 * If directly set media component to have width: 100%; height: 100%;.
 * it will stretch to preserve the aspect ratio, which stretches the container.
 * Reference: https://css-tricks.com/fluid-width-video/
 */

export default {
  name: 'VMedia',
  components: { VMediaControl },
  props: {
    // The html element of the media.
    component: {
      type: [String, Object] as PropType<string | VueConstructor>,
      required: true,
    },
    // The source of the media.
    src: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      // The duration of the media (synced when loadedmetadata is fired).
      duration: 0,
      // The currentTime of the media (synced when timeupdate is fired).
      currentTime: 0,
      // Whether the play/pause button is in pause state.
      paused: true,
      // Whether the mute/unmute button is in mute state.
      muted: false,
      // The rate for the media to dispatch timeupdate
      fps: 40,
      // The timer for manually firing timeupdate.
      timer: null as ReturnType<typeof setTimeout> | null,
      // The current playback rate.
      playbackRate: 1,
    };
  },
  watch: {
    src() {
      // Pause when the displayed content is changed.
      this.paused = true;
      // Reset the duration to unknown.
      this.duration = 0;
    },
  },
  mounted() {
    this.paused = true;
    const media = this.getMedia();
    if (media !== null) media.volume = 0.2;
  },
  methods: {
    onTimeUpdate(e: Event): void {
      const media = this.getMedia();
      if (media === null) return;
      this.currentTime = media.currentTime;
      this.$emit('timeupdate', e);
    },
    onLoadedMetadata(e: Event): void {
      const media = this.getMedia();
      if (media === null) return;
      this.duration = media.duration;
      this.$emit('loadedmetadata', e);
    },
    onEnded(): void {
      this.pause();
    },
    onSetPaused(paused: boolean): void {
      this.paused = paused;
      if (paused) this.pause();
      else this.play();
    },
    onStop(): void {
      this.pause();
      const media = this.getMedia();
      if (media === null) return;
      media.currentTime = 0;
    },
    onSetMuted(muted: boolean): void {
      const media = this.getMedia();
      if (media === null) return;
      this.muted = muted;
      media.muted = muted;
    },
    onSetPlaybackRate(playbackRate: number): void {
      const media = this.getMedia();
      if (media === null) return;
      this.playbackRate = playbackRate;
      media.playbackRate = playbackRate;
    },
    onSetCurrentTime(currentTime: number): void {
      const media = this.getMedia();
      if (media === null) return;
      media.currentTime = currentTime;
    },
    play(): void {
      const media = this.getMedia();
      if (media === null) return;
      this.paused = false;
      media.play();
      this.registerClock();
    },
    pause(): void {
      const media = this.getMedia();
      if (media === null) return;
      this.paused = true;
      media.pause();
      this.clearClock();
    },
    registerClock(): void {
      // Start dispatching timeupdate periodically.
      const media = this.getMedia();
      if (media === null) return;
      const run = () => {
        if (this.timer === null) return;
        media.dispatchEvent(new Event('timeupdate'));
        this.timer = setTimeout(run, 1000 / this.fps);
      };
      this.timer = setTimeout(run, 1000 / this.fps);
    },
    clearClock(): void {
      // Stop dispatching timeupdate periodically.
      if (this.timer === null) return;
      clearTimeout(this.timer);
      this.timer = null;
    },
    getMedia(): HTMLMediaElement | null {
      const media = this.$refs.media as HTMLMediaElement | undefined;
      return media ?? null;
    },
    getProgress(): HTMLProgressElement {
      return this.$refs.control.getProgress() as HTMLProgressElement;
    },
  },
};
</script>

<style scoped>
.media-container {
  position: relative;
}

.media-content {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>

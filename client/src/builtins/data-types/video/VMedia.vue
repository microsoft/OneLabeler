<template>
  <!-- set tabindex=0 to make it focusable -->
  <div
    ref="container"
    tabindex="0"
    :style="{
      'width': widthStr,
      'height': heightStr,
      'font-size': '24px',
      'line-height': 'initial',
      'display': 'flex',
      'flex-direction': 'column',
    }"
  >
    <!-- The media element. -->
    <component
      :is="component"
      ref="media"
      :src="src"
      :style="{ height: `calc(100% - ${controlHeight}px)` }"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
    />

    <!-- The play controls. -->
    <v-card
      class="pa-0 ma-0"
      :style="{
        height: `${controlHeight}px`,
        'border-radius': 0,
        display: 'flex',
        'flex-direction': 'row',
        'align-items': 'center',
      }"
    >
      <div
        class="px-2"
        style="display: flex; flex-direction: row; align-items: center; width: 15%;"
      >
        <v-btn
          :title="paused ? 'Play' : 'Pause'"
          icon
          tile
          small
          @click="onClickPlayPause"
        >
          <v-icon
            aria-hidden="true"
            small
          >
            {{ paused
              ? $vuetify.icons.values.play
              : $vuetify.icons.values.pause
            }}
          </v-icon>
        </v-btn>
        <v-btn
          title="Stop"
          icon
          tile
          small
          @click="onClickStop"
        >
          <v-icon
            aria-hidden="true"
            small
          >
            $vuetify.icons.values.stop
          </v-icon>
        </v-btn>
        <v-btn
          :title="muted ? 'Unmute' : 'Mute'"
          class="mr-1"
          icon
          tile
          small
          @click="onClickMute"
        >
          <v-icon
            aria-hidden="true"
            small
          >
            {{ muted
              ? $vuetify.icons.values.volume
              : $vuetify.icons.values.mute
            }}
          </v-icon>
        </v-btn>
        <span class="subtitle-2">
          {{ `${getTimeStr(currentTime)} / ${getTimeStr(duration)}` }}
        </span>
      </div>
      <div
        class="px-4"
        style="display: flex; align-items: center; width: 85%;"
      >
        <progress
          ref="progress"
          class="v-media-progress"
          :value="currentTime"
          :max="duration"
          min="0"
          style="width: 100%; height: 25px; border-radius: 0;"
          @click="onClickProgress"
        />
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'VMedia',
  props: {
    // The html element of the media.
    component: {
      type: [String, Object] as PropType<string | Vue.VueConstructor>,
      required: true,
    },
    // The source of the media.
    src: {
      type: String,
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
      // The duration of the media (synced when loadedmetadata is fired).
      duration: 0,
      // The currentTime of the media (synced when timeupdate is fired).
      currentTime: 0,
      // Wether the play/pause button is in pause state.
      paused: true,
      // Wether the mute/unmute button is in mute state.
      muted: false,
      // The rate for the media to dispatch timeupdate
      fps: 40,
      // The height of the control tool bar.
      controlHeight: 40,
      // The timer for manually firing timeupdate.
      timer: null as ReturnType<typeof setTimeout> | null,
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
  watch: {
    src() {
      // Pause when the displayed content is changed.
      this.paused = true;
    },
  },
  created(): void {
    // Bind keyboard events.
    window.addEventListener('keydown', this.onKey);
  },
  beforeDestroy(): void {
    // Remove listener before distroy,
    // otherwise the onKey method will be called multiple times.
    window.removeEventListener('keydown', this.onKey);
  },
  mounted() {
    this.paused = true;
  },
  methods: {
    onKey(e: KeyboardEvent): void {
      const { key } = e;
      // shortcut for play/pause: space
      if (key === ' ') {
        /*
        const selection = document.activeElement;
        const container = this.$refs.container as HTMLElement;
        if (selection === container) {
          this.onClickPlayPause();
        }
        */
        this.onClickPlayPause();
      }
    },
    onTimeUpdate(e: Event): void {
      const media = this.getMedia();
      this.currentTime = media.currentTime;
      this.$emit('timeupdate', e);
    },
    onLoadedMetadata(): void {
      const media = this.getMedia();
      this.duration = media.duration;
    },
    onEnded(): void {
      this.pause();
    },
    onClickPlayPause(): void {
      const media = this.getMedia();
      if (media.paused) this.play();
      else this.pause();
    },
    onClickStop(): void {
      this.pause();
      const media = this.getMedia();
      media.currentTime = 0;
    },
    onClickMute(): void {
      const media = this.getMedia();
      this.muted = !this.muted;
      media.muted = this.muted;
    },
    onClickProgress(e: MouseEvent): void {
      const progress = this.getProgress();
      const rect = progress.getBoundingClientRect();
      const offsetX = rect.x;
      const { width } = rect;
      const x = e.clientX;
      const rate = (x - offsetX) / width;
      const media = this.getMedia();
      media.currentTime = rate * media.duration;
    },
    play(): void {
      const media = this.getMedia();
      this.paused = false;
      media.play();
      this.registerClock();
    },
    pause(): void {
      const media = this.getMedia();
      this.paused = true;
      media.pause();
      this.clearClock();
    },
    registerClock(): void {
      // Start dispatching timeupdate periodically.
      const media = this.getMedia();
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
    getTimeStr(duration: number): string {
      const date = new Date(0);
      date.setSeconds(duration);
      return date.toISOString().substr(11, 8);
    },
    getMedia(): HTMLMediaElement {
      return this.$refs.media as HTMLMediaElement;
    },
    getProgress(): HTMLProgressElement {
      return this.$refs.progress as HTMLProgressElement;
    },
  },
});
</script>
<style scoped>
.v-media-progress::-webkit-progress-bar {
  background-color: #ddd;
}
.v-media-progress::-webkit-progress-value {
  background-color: #2e76ff;
}
</style>
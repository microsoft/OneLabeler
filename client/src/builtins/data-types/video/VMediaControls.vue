<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <!-- The play controls. -->
  <div
    class="toolbar"
    :style="{ height: `${height}px` }"
  >
    <div
      class="px-2"
      style="display: flex; flex-direction: row; align-items: center;"
    >
      <!-- Play/Pause button -->
      <v-btn
        :title="paused ? 'Play' : 'Pause'"
        icon
        tile
        small
        @click="$emit('set:paused', !paused)"
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
      <!-- Stop button (clear the playing progress) -->
      <v-btn
        title="Stop"
        icon
        tile
        small
        @click="$emit('stop')"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.stop
        </v-icon>
      </v-btn>
      <!-- Mute/Unmute button -->
      <v-btn
        :title="muted ? 'Unmute' : 'Mute'"
        icon
        tile
        small
        @click="$emit('set:muted', !muted)"
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
      <!-- Playback rate menu -->
      <v-menu offset-y>
        <template #activator="{ on }">
          <v-btn
            class="subtitle-2 mr-1 text-none"
            style="font-weight: bold"
            width="60"
            title="Playback Rate"
            icon
            tile
            small
            v-on="on"
          >
            {{ `X ${playbackRate}` }}
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            v-for="option in playbackRateOptions"
            :key="option"
            class="subtitle-2"
            style="min-height: 30px"
            @click="$emit('set:playback-rate', option)"
          >
            {{ `X ${option}` }}
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- The playing progress string -->
      <span class="subtitle-2">
        {{ `${getTimeStr(currentTime)} / ${getTimeStr(duration)}` }}
      </span>
    </div>
    <div
      class="px-4"
      style="flex: 1 1 auto; display: flex; align-items: center;"
    >
      <progress
        ref="progress"
        class="v-media-progress"
        :value="currentTime"
        :max="duration"
        min="0"
        style="flex: 1 1 auto; height: 25px; border-radius: 0;"
        @click="onClickProgress"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { onKeyDown } from '@vueuse/core';

export default defineComponent({
  name: 'VMediaControls',
  props: {
    // The currentTime of the media.
    currentTime: {
      type: Number as PropType<number>,
      default: 0,
    },
    // The duration of the media.
    duration: {
      type: Number as PropType<number>,
      default: 0,
    },
    // Whether the play/pause button is in pause state.
    paused: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    // Whether the mute/unmute button is in mute state.
    muted: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    // The current playback rate.
    playbackRate: {
      type: Number as PropType<number>,
      default: 1,
    },
    // The playback rate options.
    playbackRateOptions: {
      type: Array as PropType<number[]>,
      default: () => [0.25, 0.5, 1, 2, 4],
    },
    // The height of the control tool bar.
    height: {
      type: Number as PropType<number>,
      default: 40,
    },
  },
  emits: {
    stop: null,
    'set:muted': null,
    'set:playback-rate': null,
    'set:paused': null,
    'set:current-time': null,
  },
  setup(props, { emit }) {
    // shortcut for play/pause: space
    const { paused } = toRefs(props);
    const container = ref(null);
    onKeyDown(' ', () => {
      // if (document.activeElement !== container.value) return;
      emit('set:paused', !paused.value);
    });

    return { container };
  },
  methods: {
    onClickProgress(e: MouseEvent): void {
      const progress = this.getProgress();
      const rect = progress.getBoundingClientRect();
      const offsetX = rect.x;
      const { width } = rect;
      const x = e.clientX;
      const rate = (x - offsetX) / width;
      const currentTimeUpdated = rate * this.duration;
      this.$emit('set:current-time', currentTimeUpdated);
    },
    getTimeStr(duration: number): string {
      const date = new Date(0);
      date.setSeconds(duration);
      return date.toISOString().substr(14, 5);
    },
    getProgress(): HTMLProgressElement {
      return this.$refs.progress as HTMLProgressElement;
    },
  },
});
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  box-shadow:
    0 3px 1px -2px rgb(0 0 0 / 20%),
    0 2px 2px 0 rgb(0 0 0 / 14%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
}

.v-media-progress::-webkit-progress-bar {
  background-color: #ddd;
}

.v-media-progress::-webkit-progress-value {
  background-color: #2e76ff;
}
</style>

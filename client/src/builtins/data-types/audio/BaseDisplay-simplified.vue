<template>
  <div
    ref="container"
    :style="{
      'width': widthStr,
      'height': heightStr,
      'display': 'flex',
      'flex-direction': 'column',
    }"
  >
    <!-- Note: flex item by default is not allowed to be smaller than its content
      unless min-width and/or min-height is set. -->
    <div
      ref="waveform"
      class="waveform-container"
      :style="{
        flex: '1 1 auto',
        'min-width': 0,
        'min-height': 0,
        'margin-left': slotXRange === null ? undefined : `${slotXRange.left}px`,
        width: slotXRange === null ? undefined : `${slotXRange.width}px`,
      }"
    />
    <VMedia
      ref="vmedia"
      component="audio"
      :src="dataObject.content"
      @timeupdate="onTimeUpdate"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  computed,
  defineComponent,
  ref,
  toRefs,
  onMounted,
  watch,
  ComputedRef,
  PropType,
  Ref,
} from '@vue/composition-api';
import WaveSurfer from 'wavesurfer.js';
import { IAudio } from '@/commons/types';
import useResizeObserver from '@/components/composables/useResizeObserver';
import VMedia from '../video/VMedia.vue';

const useWaveform = (
  waveform: Ref<HTMLDivElement | null>,
  media: Ref<HTMLMediaElement | null>,
  responsive: boolean,
) => {
  const wavesurfer: Ref<WaveSurfer | null> = ref(null);

  const render = (): void => {
    if (waveform.value === null) return;
    if (media.value === null) return;

    // Clear the canvas.
    wavesurfer.value?.destroy();

    // Draw waveform.
    wavesurfer.value = WaveSurfer.create({
      container: waveform.value,
      height: waveform.value.clientHeight,
      responsive,
      fillParent: true,
      interact: false,
    });
    wavesurfer.value.load(media.value);
  };

  const setCurrentTime = (seconds: number): void => {
    if (wavesurfer.value === null) return;
    wavesurfer.value.setCurrentTime(seconds);
  };

  return { wavesurfer, render, setCurrentTime };
};

const useResponsive = (
  waveform: Ref<HTMLElement | null>,
  wavesurfer: Ref<WaveSurfer | null>,
) => {
  const onResize = (): void => {
    if (wavesurfer.value === null) return;
    if (waveform.value === null) return;

    // Resize waveform
    wavesurfer.value.setHeight(waveform.value.clientHeight);
  };
  useResizeObserver(waveform, onResize);
};

export default defineComponent({
  name: 'BaseDisplay',
  components: { VMedia },
  props: {
    // The data object to be rendered.
    dataObject: {
      type: Object as PropType<IAudio>,
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
  setup(props, { emit }) {
    const { dataObject, width, height } = toRefs(props);

    const container: Ref<HTMLDivElement | null> = ref(null);
    const waveform: Ref<HTMLDivElement | null> = ref(null);
    const vmedia: Ref<Vue.VueConstructor & {
      getMedia: () => HTMLMediaElement | null,
      getProgress: () => HTMLProgressElement,
    } | null> = ref(null);

    const media: Ref<HTMLMediaElement | null> = ref(null);
    const progress: Ref<HTMLProgressElement | null> = ref(null);

    const waveformChart = useWaveform(waveform, media, false);
    const slotXRange: Ref<{ left: number, width: number } | null> = ref(null);

    const getMedia = (): HTMLMediaElement | null => vmedia.value?.getMedia() ?? null;
    const getProgress = (): HTMLProgressElement | null => vmedia.value?.getProgress() ?? null;

    const getSlotXRange = (): { left: number, width: number } | null => {
      if (progress.value === null) return null;
      if (container.value === null) return null;
      const rect = progress.value.getBoundingClientRect();
      const containerX = container.value.getBoundingClientRect().left;
      return { left: rect.left - containerX, width: rect.width };
    };

    const widthStr: ComputedRef<string> = computed((): string => {
      if (typeof width.value === 'number') return `${width.value}px`;
      return width.value;
    });
    const heightStr: ComputedRef<string> = computed((): string => {
      if (typeof height.value === 'number') return `${height.value}px`;
      return height.value;
    });

    const onTimeUpdate = (e: Event): void => {
      emit('timeupdate', e);
      if (media.value === null) return;
      waveformChart.setCurrentTime(media.value.currentTime);
    };

    watch(dataObject, waveformChart.render);

    onMounted(async () => {
      media.value = getMedia();
      progress.value = getProgress();
      slotXRange.value = getSlotXRange();
      waveformChart.render();
    });

    useResponsive(waveform, waveformChart.wavesurfer);

    useResizeObserver(container, () => {
      slotXRange.value = getSlotXRange();
    });

    return {
      container,
      waveform,
      vmedia,
      widthStr,
      heightStr,
      getMedia,
      getProgress,
      onTimeUpdate,
      slotXRange,
    };
  },
});
</script>

<style lang="scss">
.waveform-container > wave {
  overflow: hidden !important;
}
</style>

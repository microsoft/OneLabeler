<template>
  <div
    ref="container"
    style="display: flex; flex-direction: column;"
  >
    <div
      ref="spectrogram"
      class="spectrogram-container"
      :style="{
        flex: '1 1 80%',
        'min-width': 0,
        'min-height': 0,
        'margin-left': slotXRange === null ? undefined : `${slotXRange.left}px`,
        width: slotXRange === null ? undefined : `${slotXRange.width}px`,
      }"
    />
    <!-- Note: flex item by default is not allowed to be smaller than its content
      unless min-width and/or min-height is set. -->
    <div
      ref="waveform"
      class="waveform-container"
      :style="{
        flex: '1 1 20%',
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
import type { VueConstructor } from 'vue';
import { debounce } from 'lodash';
import {
  defineComponent,
  ref,
  toRefs,
  onMounted,
  watch,
  PropType,
  Ref,
} from '@vue/composition-api';
import WaveSurfer from 'wavesurfer.js';
import SpectrogramPlugin from 'wavesurfer.js/src/plugin/spectrogram';
import type { IAudio } from '@/commons/types';
import { useResizeObserver } from '@/components/composables/useResize';
import VMedia from '../video/VMedia.vue';

const fitSpectrogramToContainer = (
  spectrogram: HTMLDivElement,
): void => {
  const observer = new MutationObserver(() => {
    if (spectrogram.getElementsByTagName('canvas')[0] !== undefined) {
      const spectrogramCanvas = spectrogram.getElementsByTagName('canvas')[0];
      spectrogramCanvas.style.height = `${spectrogram.clientHeight}px`;
      observer.disconnect();
    }
  });
  observer.observe(
    spectrogram,
    {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: true,
    },
  );
};

const useWaveform = (
  waveform: Ref<HTMLDivElement | null>,
  media: Ref<HTMLMediaElement | null>,
  spectrogram: Ref<HTMLDivElement | null>,
  responsive: boolean,
) => {
  const wavesurfer: Ref<WaveSurfer | null> = ref(null);

  const render = (): void => {
    if (waveform.value === null) return;
    if (media.value === null) return;
    if (spectrogram.value === null) return;

    // Clear the canvas.
    wavesurfer.value?.destroy();

    // Draw waveform.
    wavesurfer.value = WaveSurfer.create({
      container: waveform.value,
      height: waveform.value.clientHeight,
      responsive,
      fillParent: true,
      interact: false,
      plugins: [SpectrogramPlugin.create({
        container: spectrogram.value,
        fftSamples: 1024,
      })],
    });
    wavesurfer.value.load(media.value);

    fitSpectrogramToContainer(spectrogram.value);
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
  spectrogram: Ref<HTMLDivElement | null>,
) => {
  const onResize = (): void => {
    if (wavesurfer.value === null) return;
    if (waveform.value === null) return;

    // Resize waveform
    wavesurfer.value.setHeight(waveform.value.clientHeight);

    // Resize spectrogram
    if (spectrogram.value === null) return;
    const spectrogramCanvas = spectrogram.value.getElementsByTagName('canvas')[0];
    if (spectrogramCanvas === undefined) return;
    spectrogramCanvas.style.height = `${spectrogram.value.clientHeight}px`;
    spectrogramCanvas.style.width = `${spectrogram.value.clientWidth}px`;
  };
  useResizeObserver(waveform, debounce(onResize, 200));
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
  },
  setup(props, { emit }) {
    const { dataObject } = toRefs(props);

    const container: Ref<HTMLDivElement | null> = ref(null);
    const spectrogram: Ref<HTMLDivElement | null> = ref(null);
    const waveform: Ref<HTMLDivElement | null> = ref(null);
    const vmedia: Ref<VueConstructor & {
      getMedia: () => HTMLMediaElement | null,
      getProgress: () => HTMLProgressElement,
    } | null> = ref(null);

    const media: Ref<HTMLMediaElement | null> = ref(null);
    const progress: Ref<HTMLProgressElement | null> = ref(null);

    const waveformChart = useWaveform(waveform, media, spectrogram, false);
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

    useResponsive(waveform, waveformChart.wavesurfer, spectrogram);

    useResizeObserver(container, () => {
      slotXRange.value = getSlotXRange();
    });

    return {
      container,
      spectrogram,
      waveform,
      vmedia,
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
.spectrogram-container > spectrogram {
  height: 100% !important;
}
</style>

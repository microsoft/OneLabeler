<template>
  <div
    ref="container"
    :style="{
      'min-width': 0,
      'min-height': 0,
    }"
  >
    <canvas ref="canvas" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  toRefs,
  onMounted,
  watch,
  PropType,
  Ref,
} from '@vue/composition-api';
import { resample2d } from '@/plugins/sampling';
import useResizeObserver from '@/components/composables/useResizeObserver';

const getFFT = async (
  url: string,
  sampleRate = 17640,
): Promise<Uint8Array[]> => {
  const buffer = await (await fetch(url)).arrayBuffer();
  console.log(buffer.byteLength, buffer);
  const ctx = new OfflineAudioContext(2, buffer.byteLength, sampleRate);
  const bufferSource = ctx.createBufferSource();
  bufferSource.buffer = await ctx.decodeAudioData(buffer);

  const analyser = ctx.createAnalyser();

  // TODO: ScriptProcessorNode is deprecated. Use AudioWorkletNode instead.
  const scp = ctx.createScriptProcessor(256, 0, 1);

  bufferSource.connect(analyser);
  scp.connect(ctx.destination); // this is necessary for the script processor to start

  const chunks: Uint8Array[] = [];
  scp.onaudioprocess = () => {
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqData);
    chunks.push(freqData);
  };

  bufferSource.start(0);

  return new Promise((resolve) => {
    ctx.oncomplete = () => resolve(chunks);
    ctx.startRendering();
  });
};

let fft: Uint8Array[] | null = null;

const colorMap = new Array(256).map((d, i) => {
  const val = (255 - i) / 255;
  return [val, val, val, 1];
});

export default defineComponent({
  name: 'VSpectrogram',
  props: {
    // The url of the audio resource.
    src: {
      type: String as PropType<string>,
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
  setup(props) {
    const { src } = toRefs(props);

    const container: Ref<HTMLDivElement | null> = ref(null);
    const canvas: Ref<HTMLCanvasElement | null> = ref(null);

    const render = async (): Promise<void> => {
      if (canvas.value === null) return;
      if (fft === null) return;
      const height = canvas.value.clientHeight;
      const width = canvas.value.clientWidth;

      // Note: the first dimension of fft result is time,
      // the second dimension of fft result is frequency.
      const resampled = resample2d(fft, width, height);
      const ctx = canvas.value.getContext('2d');
      if (ctx === null) return;
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;

      const imageData = ctx.createImageData(width, height);
      for (let i = 0; i < height; i += 1) {
        for (let j = 0; j < width; j += 1) {
          const redIndex = (height - i) * (width * 4) + j * 4;
          const color = colorMap[resampled[j][i]];
          imageData.data[redIndex] = color[0] * 255;
          imageData.data[redIndex + 1] = color[1] * 255;
          imageData.data[redIndex + 2] = color[2] * 255;
          imageData.data[redIndex + 3] = color[3] * 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };

    const onResize = (): void => {
      if (container.value === null) return;
      if (canvas.value === null) return;
      canvas.value.width = container.value.clientWidth;
      canvas.value.height = container.value.clientHeight;
      render();
    };

    useResizeObserver(container, onResize);
    watch(src, async () => {
      fft = await getFFT(src.value);
      const maxHeight = 1000;
      const maxWidth = 2000;
      fft = resample2d(fft, maxWidth, maxHeight);
      render();
    });
    onMounted(async () => {
      fft = await getFFT(src.value);
      const maxHeight = 1000;
      const maxWidth = 2000;
      fft = resample2d(fft, maxWidth, maxHeight);
      render();
    });

    return {
      container,
      canvas,
    };
  },
});
</script>

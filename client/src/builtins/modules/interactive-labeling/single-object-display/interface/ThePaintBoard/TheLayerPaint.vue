<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <v-layer
    ref="layer"
    :config="{
      imageSmoothingEnabled: false,
      clip: {
        x: 0,
        y: 0,
        width,
        height,
      },
    }"
    style="image-rendering: pixelated"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import Konva from 'konva';
import type { ILabelMask } from '@/commons/types';
import type { VueKonvaLayer } from './types';

const createImage = async (
  url: string,
): Promise<HTMLImageElement> => new Promise((resolve) => {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    resolve(img);
  };
  // The url that services the image content (can be a base64 style url).
  img.src = url;
});

export default defineComponent({
  name: 'TheLayerPaint',
  props: {
    width: {
      type: Number as PropType<number | null>,
      default: null,
    },
    height: {
      type: Number as PropType<number | null>,
      default: null,
    },
    labelMask: {
      type: Object as PropType<ILabelMask | null>,
      default: null,
    },
  },
  watch: {
    async labelMask(): Promise<void> {
      await this.drawLabelMask();
    },
  },
  async mounted(): Promise<void> {
    // Note: set canvas style opacity instead of in configuration
    // if set opacity in configuration,
    // each object would be transparent but not the whole canvas
    const layer = this.getLayer();
    // eslint-disable-next-line no-underscore-dangle
    const canvas = layer.getCanvas()._canvas;
    canvas.style.opacity = '0.5';

    await this.drawLabelMask();
  },
  methods: {
    getLayer(): Konva.Layer {
      return (this.$refs.layer as VueKonvaLayer).getNode();
    },
    async drawLabelMask(): Promise<void> {
      const { labelMask } = this;
      const layer = this.getLayer();

      // clean layer
      // TODO: destroy children cause the the mask to flash when mask is updated
      layer.destroyChildren();
      if (labelMask === null || labelMask.content === null) return;

      const image: HTMLImageElement = await createImage(labelMask.content);
      layer.add(new Konva.Image({ image }));
    },
  },
});
</script>

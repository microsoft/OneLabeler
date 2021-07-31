<template>
  <v-layer
    :config="{ imageSmoothingEnabled: false }"
    style="image-rendering: pixelated"
  >
    <v-image
      ref="image"
      :config="{
        image,
        shadowColor: 'black',
        shadowOpacity: 0.4,
      }"
    />
  </v-layer>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import Konva from 'konva';

type VueKonvaImage = Vue & { getNode: () => Konva.Image };

// Create an image element given the image url.
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

export default Vue.extend({
  name: 'TheLayerImage',
  props: {
    /** The image url. */
    src: {
      type: String as PropType<string | null>,
      default: null,
    },
    blur: {
      type: Number as PropType<number>,
      default: 3,
    },
  },
  data() {
    return {
      image: null as HTMLImageElement | null,
    };
  },
  watch: {
    async src() {
      // Loading image from url is asynchronous,
      // thus first set the image to null to avoid bumping effect.
      this.image = null;
      await this.setImage();
    },
    blur() {
      this.setImageBlur();
    },
  },
  async mounted() {
    await this.setImage();
  },
  methods: {
    async setImage(): Promise<void> {
      if (this.src === null) return;
      this.image = await createImage(this.src);
      this.setImageBlur();
    },
    setImageBlur(): void {
      const image = this.getImage();
      const { blur } = this;
      image.shadowBlur(blur);
      image.shadowOffset({ x: blur, y: blur });
    },
    getImage(): Konva.Image {
      return (this.$refs.image as VueKonvaImage).getNode();
    },
  },
});
</script>

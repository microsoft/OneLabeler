<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div ref="container">
    <svg
      width="0"
      height="0"
      style="width: 100%; height: 100%;"
    >
      <g :transform="transform">
        <image
          style="image-rendering: pixelated"
          :href="src"
          :width="dataObject.width"
          :height="dataObject.height"
        />
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  toRefs,
  ComputedRef,
  PropType,
  Ref,
} from '@vue/composition-api';
import { useElementSize } from '@vueuse/core';
import { calFittingTransform } from '@/commons/geometry';
import type { IImage } from '@/commons/types';

/**
 * Implementation note:
 * - flex: 1 1 auto does not work on svg like it works on div.
 * Thus, wrap the svg with a div, make the div size responsive,
 * and update the svg with the div is resized.
 * - Set width and height attribute to 0 to undo the default
 * svg size (with width being 300 and height being 150)
 * and set width: 100%; height: 100%; to make it responsive.
 */

export default defineComponent({
  name: 'BaseDisplay',
  props: {
    /** The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IImage>,
      required: true,
    },
  },
  setup(props) {
    const { dataObject } = toRefs(props);
    const container: Ref<HTMLElement | null> = ref(null);
    const { width, height } = useElementSize(container);

    // Compute the scaling of the image to fit the svg.
    const transform: ComputedRef<string> = computed(() => {
      if (width.value === null || height.value === null) return '';
      const imgWidth = dataObject.value?.width ?? null;
      const imgHeight = dataObject.value?.height ?? null;
      if (imgWidth === null || imgHeight === null) return '';
      return calFittingTransform({
        xMin: 0,
        xMax: imgWidth,
        yMin: 0,
        yMax: imgHeight,
      }, width.value, height.value);
    });

    return { container, transform };
  },
  computed: {
    src(): string {
      const { content, url } = this.dataObject;
      return content ?? url ?? '';
    },
  },
});
</script>

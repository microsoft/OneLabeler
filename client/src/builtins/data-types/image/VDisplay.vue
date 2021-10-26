<template>
  <div ref="container">
    <svg
      ref="svg"
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
  onMounted,
  onUpdated,
  ref,
  toRefs,
  ComputedRef,
  PropType,
  Ref,
} from '@vue/composition-api';
import { calFittingTransform } from '@/commons/geometry';
import { IImage } from '@/commons/types';
import useResizeObserver from '@/components/composables/useResizeObserver';

/**
 * Implementation note:
 * - flex: 1 1 auto does not work on svg like it works on div.
 * Thus, wrap the svg with a div, make the div size responsive,
 * and update the svg with the div is resized.
 * - Set width and height attribute to 0 to undo the default
 * svg size (with width being 300 and height being 150).
 */

/** Get continuously updated svg size. */
const useSvgSize = (
  container: Ref<HTMLElement | null>,
  svg: Ref<HTMLElement | null>,
) => {
  const svgWidth: Ref<number | null> = ref(null);
  const svgHeight: Ref<number | null> = ref(null);

  // Store the size of the svg.
  const getSvgSize = (): void => {
    if (svg.value === null) return;
    svgWidth.value = svg.value.clientWidth;
    svgHeight.value = svg.value.clientHeight;
  };

  useResizeObserver(container, getSvgSize);
  onMounted(getSvgSize);
  onUpdated(getSvgSize);

  return { svgWidth, svgHeight };
};

export default defineComponent({
  name: 'VDisplay',
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
    const svg: Ref<HTMLElement | null> = ref(null);
    const { svgWidth, svgHeight } = useSvgSize(container, svg);

    // Compute the scaling of the image to fit the svg.
    const transform: ComputedRef<string> = computed(() => {
      if (svgWidth.value === null || svgHeight.value === null) return '';
      const imgWidth = dataObject.value?.width ?? null;
      const imgHeight = dataObject.value?.height ?? null;
      if (imgWidth === null || imgHeight === null) return '';
      return calFittingTransform({
        xMin: 0,
        xMax: imgWidth,
        yMin: 0,
        yMax: imgHeight,
      }, svgWidth.value, svgHeight.value);
    });

    return { container, svg, transform };
  },
  computed: {
    src(): string {
      const { content, url } = this.dataObject;
      return content ?? url ?? '';
    },
  },
});
</script>

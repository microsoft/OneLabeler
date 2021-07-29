<template>
  <svg
    ref="svg"
    :height="height"
    :width="width"
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
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUpdated,
  ref,
  toRefs,
  watch,
  ComputedRef,
  PropType,
  Ref,
} from '@vue/composition-api';
import { IImage } from '@/commons/types';

/**
 * Compute the linear transformation that transform
 * the rectangle [xMin, xMax] x [yMin, yMax]
 * to fit the target rectangular area [0, targetWidth] x [0, targetHeight]
 * without changing the aspect ratio of the rectangle.
 */
const calFittingTransform = (
  rect: { xMin: number, xMax: number, yMin: number, yMax: number },
  targetWidth: number,
  targetHeight: number,
): string => {
  const {
    xMin, xMax, yMin, yMax,
  } = rect;

  const width = xMax - xMin;
  const height = yMax - yMin;
  // the scale preserves the aspect ratio
  const scale = Math.min(
    targetWidth / width,
    targetHeight / height,
  );
  const cx = (xMax + xMin) / 2;
  const cy = (yMax + yMin) / 2;

  // the transformation for setting the object to the center of the target
  const strCenterBackground = `translate(${targetWidth / 2}, ${targetHeight / 2})`;
  // the transformation for scaling the concerned area of the object to fit the target size
  const strScale = Number.isNaN(scale) ? '' : `scale(${scale})`;
  // the transformation for setting the center of the object to the (0, 0) position in the target
  const strCenterItem = Number.isNaN(cx) || Number.isNaN(cy) ? '' : `translate(${-cx}, ${-cy})`;

  return strCenterBackground + strScale + strCenterItem;
};

/** Compute the transform for moving the image to the convas center. */
const useSvgSize = (
  svg: Ref<HTMLElement | null>,
  width: Ref<number | string | null>,
  height: Ref<number | string | null>,
) => {
  const svgWidth: Ref<number | null> = ref(null);
  const svgHeight: Ref<number | null> = ref(null);

  // Store the size of the svg.
  const getSvgSize = (): void => {
    if (svg.value === null) return;
    svgWidth.value = svg.value.clientWidth;
    svgHeight.value = svg.value.clientHeight;
  };

  onMounted(getSvgSize);
  onUpdated(getSvgSize);
  watch(width, getSvgSize);
  watch(height, getSvgSize);

  return { svgWidth, svgHeight };
};

export default defineComponent({
  name: 'VDisplay',
  props: {
    /** @description The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IImage>,
      required: true,
    },
    /** @description The width of the svg as a number or string of form '...%'. */
    width: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
    /** @description The height of the svg as a number or string of form '...%'. */
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
    const { width, height, dataObject } = toRefs(props);
    const svg: Ref<HTMLElement | null> = ref(null);
    const { svgWidth, svgHeight } = useSvgSize(svg, width, height);

    // Compute the scaling of the image to fit the svg.
    const transform: ComputedRef<string> = computed(() => {
      if (svgWidth.value === null || svgHeight.value === null) return '';
      if (dataObject.value === null || dataObject.value.width === null) return '';
      if (dataObject.value === null || dataObject.value.height === null) return '';
      return calFittingTransform({
        xMin: 0,
        xMax: dataObject.value.width,
        yMin: 0,
        yMax: dataObject.value.height,
      }, svgWidth.value, svgHeight.value);
    });

    return { svg, transform };
  },
  computed: {
    src(): string {
      const { content, url } = this.dataObject;
      if (content !== null && content !== undefined) return content;
      if (url !== null && url !== undefined) return url;
      return '';
    },
  },
});
</script>

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
import Vue, { PropType } from 'vue';
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

export default Vue.extend({
  name: 'VDisplayImage',
  props: {
    /**
     * @description The data object to be rendered.
     */
    dataObject: {
      type: Object as PropType<IImage>,
      required: true,
    },
    /**
     * @description The width of the svg as a number or string of form '...%'
     */
    width: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
    /**
     * @description The height of the svg as a number or string of form '...%'
     */
    height: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
  },
  data(): {
  svgWidth: number | null,
  svgHeight: number | null,
  } {
    return {
      /**
       * @description The width and height of svg as a number or undefined.
       */
      svgWidth: null,
      svgHeight: null,
    };
  },
  computed: {
    src(): string {
      const { content, url } = this.dataObject;
      if (content !== null && content !== undefined) return content;
      if (url !== null && url !== undefined) return url;
      return '';
    },
    transform(): string {
      // Compute the scaling of the image to fit the svg.
      const { dataObject, svgWidth, svgHeight } = this;

      if (svgWidth === null || svgHeight === null) {
        return '';
      }

      return calFittingTransform({
        xMin: 0,
        xMax: dataObject.width as number,
        yMin: 0,
        yMax: dataObject.height as number,
      }, svgWidth, svgHeight);
    },
  },
  watch: {
    width(): void {
      // When the size of the svg is to be changed, recompute the transform.
      this.setSvgSize();
    },
    height(): void {
      // When the size of the svg is to be changed, recompute the transform.
      this.setSvgSize();
    },
  },
  mounted() {
    this.setSvgSize();
  },
  updated() {
    this.setSvgSize();
  },
  methods: {
    setSvgSize(): void {
      const { svg } = this.$refs as { svg: HTMLElement };
      this.svgWidth = svg.clientWidth;
      this.svgHeight = (typeof this.height === 'number') ? this.height : svg.clientHeight;
    },
  },
});
</script>

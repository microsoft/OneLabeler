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
      />
      <polygon
        stroke-width="1"
        fill-opacity="0.5"
        :stroke="stroke"
        :points="dataObject.contour.map((d) => d.map((x) => x + 0.5).join(',')).join(' ')"
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
import { calFittingTransform } from '@/commons/geometry';
import { IDataObject, ILabel } from '@/commons/types';

interface IBlock extends IDataObject {
  contour: [number, number][];
  xMin: number;
  yMin: number;
  width: number;
  height: number;
}

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
      type: Object as PropType<IBlock>,
      required: true,
    },
    /** @description The label of data object to be rendered. */
    label: {
      type: Object as PropType<ILabel | undefined>,
      required: true,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
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
        xMin: dataObject.value.xMin,
        xMax: dataObject.value.xMin + dataObject.value.width,
        yMin: dataObject.value.yMin,
        yMax: dataObject.value.yMin + dataObject.value.height,
      }, svgWidth.value, svgHeight.value);
    });

    return { svg, transform };
  },
  computed: {
    src(): string {
      return this.dataObject.src ?? '';
    },
    stroke(): string {
      const { label, label2color, unlabeledMark } = this;
      if (label2color === null || label2color === undefined) return 'black';
      if (label === null || label === undefined) return label2color(unlabeledMark);
      if (label.category !== undefined) return label2color(label.category);
      return label2color(unlabeledMark);
    },
  },
});
</script>

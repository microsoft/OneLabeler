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
        />
        <polygon
          stroke-width="1"
          fill-opacity="0.5"
          :stroke="stroke"
          :points="dataObject.contour.map((d) => d.map((x) => x + 0.5).join(',')).join(' ')"
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
import { calFittingTransform } from '@/commons/geometry';
import { Category, IDataObject, ILabel } from '@/commons/types';
import { useElementSize } from '@/components/composables/useResize';

/**
 * Implementation note:
 * - flex: 1 1 auto does not work on svg like it works on div.
 * Thus, wrap the svg with a div, make the div size responsive,
 * and update the svg with the div is resized.
 * - Set width and height attribute to 0 to undo the default
 * svg size (with width being 300 and height being 150).
 */

interface IBlock extends IDataObject {
  contour: [number, number][];
  xMin: number;
  yMin: number;
  width: number;
  height: number;
}

export default defineComponent({
  name: 'BaseDisplay',
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
    unlabeledMark: {
      type: String as PropType<Category>,
      default: null,
    },
  },
  setup(props) {
    const { dataObject } = toRefs(props);
    const container: Ref<HTMLElement | null> = ref(null);
    const { width, height } = useElementSize(container);

    // Compute the scaling of the image to fit the svg.
    const transform: ComputedRef<string> = computed(() => {
      if (width.value === null || height.value === null) return '';
      if (dataObject.value === null || dataObject.value.width === null) return '';
      if (dataObject.value === null || dataObject.value.height === null) return '';
      return calFittingTransform({
        xMin: dataObject.value.xMin,
        xMax: dataObject.value.xMin + dataObject.value.width,
        yMin: dataObject.value.yMin,
        yMax: dataObject.value.yMin + dataObject.value.height,
      }, width.value, height.value);
    });

    return { container, transform };
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

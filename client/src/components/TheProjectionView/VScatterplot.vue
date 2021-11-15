<template>
  <div
    ref="container"
    style="display: flex"
  >
    <svg
      ref="svg"
      style="flex: 1 1 auto;"
    >
      <VScatterplot
        :data="data"
        :width="width"
        :height="height"
        :margin="margin"
        :x-axis="xAxis"
        :y-axis="yAxis"
        :x-map="(d) => d.x"
        :y-map="(d) => d.y"
        :r-map="rMap"
        :fill-map="fillMap"
      />
      <VLasso
        :width="width"
        :height="height"
        @lasso:end="$emit('select:indices', getSelectedIndices($event))"
      />
    </svg>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  PropType,
  Ref,
} from '@vue/composition-api';
import * as d3 from 'd3';
import VLasso from '@/plugins/lasso/VLasso.vue';
import VScatterplot, { Axis } from '@/plugins/scatterplot/VScatterplot.vue';
import useResizeObserver from '@/components/composables/useResizeObserver';

type Point = [number, number];
type Polygon = Point[];

/** Get continuously updated element size. */
const useElementSize = (element: Ref<HTMLElement | null>) => {
  const width: Ref<number | null> = ref(null);
  const height: Ref<number | null> = ref(null);

  // Store the size of the element.
  const getSize = (): void => {
    if (element.value === null) return;
    width.value = element.value.clientWidth;
    height.value = element.value.clientHeight;
  };

  useResizeObserver(element, getSize);
  onMounted(getSize);

  return { width, height };
};

export default defineComponent({
  name: 'VScatterplotWrapper',
  components: { VLasso, VScatterplot },
  props: {
    points: {
      type: Array as PropType<Point[] | null>,
      default: null,
    },
    colormap: {
      type: Function as PropType<((idx: number) => string) | null>,
      default: null,
    },
    highlightIndices: {
      type: Array as PropType<number[] | null>,
      default: null,
    },
    xAxis: {
      type: Object as PropType<Axis | null>,
      default: null,
    },
    yAxis: {
      type: Object as PropType<Axis | null>,
      default: null,
    },
    dotRadius: {
      type: Number as PropType<number>,
      default: 3,
    },
  },
  setup() {
    const svg: Ref<HTMLElement | null> = ref(null);
    const container: Ref<HTMLElement | null> = ref(null);
    const { width, height } = useElementSize(container);
    return {
      svg,
      container,
      width,
      height,
    };
  },
  data() {
    return {
      margin: {
        top: 20,
        right: 10,
        left: 30,
        bottom: 30,
      },
    };
  },
  computed: {
    data(): ({ x: number, y: number }[]) {
      const { points } = this;
      if (points === null) return [];
      return points.map((d) => ({ x: d[0], y: d[1] }));
    },
    rMap(): ((d: unknown, i: number) => number) {
      const { highlightIndices, dotRadius } = this;
      if (
        highlightIndices === null
        || highlightIndices.length === 0
      ) {
        return () => dotRadius;
      }
      const highlighted = Object.fromEntries(
        highlightIndices.map((d) => [d, true]),
      );
      return (d: unknown, i: number) => (i in highlighted ? dotRadius : dotRadius / 2);
    },
    fillMap(): (((d: unknown, i: number) => string) | null) {
      const { colormap } = this;
      if (colormap === null) return null;
      return (d: unknown, i: number) => colormap(i);
    },
  },
  methods: {
    getSelectedIndices(lassoPolygon: Polygon): number[] {
      const svg = this.$refs.svg as SVGSVGElement;
      const { margin } = this;
      const selectedIndices: number[] = [];
      d3.select(svg)
        .selectAll<SVGCircleElement, undefined>('circle')
        .each(function _(d: undefined, i: number) {
          const x = +(this.getAttribute('cx') as string);
          const y = +(this.getAttribute('cy') as string);
          if (d3.polygonContains(
            lassoPolygon,
            [x + margin.left, y + margin.top],
          )) {
            selectedIndices.push(i);
          }
        });
      return selectedIndices;
    },
  },
});
</script>

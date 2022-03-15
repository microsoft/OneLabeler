<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    ref="container"
    style="display: flex"
  >
    <svg style="flex: 1 1 auto">
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
  ref,
  PropType,
  Ref,
} from '@vue/composition-api';
import { polygonContains } from 'd3';
import { useElementSize } from '@vueuse/core';
import VLasso from '@/plugins/lasso/VLasso.vue';
import VScatterplot, { Axis } from '@/plugins/scatterplot/VScatterplot.vue';

type Point = [number, number];
type Polygon = Point[];

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
  emits: {
    'select:indices': null,
  },
  setup() {
    const container: Ref<HTMLElement | null> = ref(null);
    return {
      container,
      ...useElementSize(container),
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
      const container = this.$refs.container as HTMLElement;
      const selectedIndices: number[] = [];
      [...container.getElementsByTagName('circle')]
        .forEach((d: SVGCircleElement, i: number) => {
          const x = +(d.getAttribute('cx') as string);
          const y = +(d.getAttribute('cy') as string);
          if (polygonContains(lassoPolygon, [x, y])) {
            selectedIndices.push(i);
          }
        });
      return selectedIndices;
    },
  },
});
</script>

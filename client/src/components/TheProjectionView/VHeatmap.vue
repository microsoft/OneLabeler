<template>
  <div
    ref="container"
    style="display: flex"
  >
    <svg
      ref="svg"
      style="flex: 1 1 auto;"
    >
      <VHeatmap
        :data="data"
        :width="width"
        :height="height"
        :margin="{
          top: 20,
          right: 10,
          left: 30,
          bottom: 30,
        }"
        :n-rows="nRows"
        :n-columns="nColumns"
        :x-axis="xAxis"
        :y-axis="yAxis"
        :x-map="(d) => d.x"
        :y-map="(d) => d.y"
      >
        <template #cell="slotProps">
          <rect
            :width="Math.max(slotProps.width - 2, 0)"
            :height="Math.max(slotProps.height - 2, 0)"
            :x="slotProps.x + 1"
            :y="slotProps.y + 1"
            :fill="slotProps.fill"
            :stroke="strokeMap(slotProps.datum)"
            stroke-width="1"
            @click="$emit('select:indices', slotProps.datum.indices)"
          />
        </template>
      </VHeatmap>
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
import VHeatmap, { Axis, BinDatum } from '@/plugins/heatmap/VHeatmap.vue';
import { useElementSize } from '@/components/composables/useResize';

type Point = [number, number];

export default defineComponent({
  name: 'VHeatmapWrapper',
  components: { VHeatmap },
  props: {
    points: {
      type: Array as PropType<Point[] | null>,
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
    nRows: {
      type: Number as PropType<number>,
      default: 10,
    },
    nColumns: {
      type: Number as PropType<number>,
      default: 10,
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
  computed: {
    data(): ({ x: number, y: number }[]) {
      const { points } = this;
      if (points === null) return [];
      return points.map((d, i) => ({ x: d[0], y: d[1], index: i }));
    },
  },
  methods: {
    strokeMap(d: BinDatum): string {
      const { highlightIndices } = this;
      if (highlightIndices === null || highlightIndices.length === 0) return 'white';
      const union = new Set([...d.indices].filter(
        (uuid) => highlightIndices.includes(uuid),
      ));
      return union.size > 0 ? 'black' : 'white';
    },
  },
});
</script>

<template>
  <v-card style="display: flex; flex-direction: column;">
    <TheImageOverviewHeader
      @window:minimize="$emit('update:task-window', { isMinimized: true })"
      @window:pin="$emit('update:task-window', { isPinned: true })"
    />
    <v-divider />
    <div
      ref="container"
      style="flex: 1 1 auto; display: flex; align-items: center;"
    >
      <svg
        v-if="dataObjects.length !== 0"
        style="width: 100%; height: 100%;"
      >
        <g :transform="transform">
          <image
            v-if="dataObjects.length !== 0"
            :href="dataObjects[0].src"
            style="image-rendering: pixelated"
            opacity="0.5"
          />
          <polygon
            v-for="({ uuid, contour }, i) in dataObjects"
            :key="uuid"
            stroke-width="1.5"
            style="pointer-events: none"
            fill-opacity="0"
            :stroke="getColorByIdx(i)"
            :points="contour.map(d => d.map(x => x + 0.5).join(',')).join(' ')"
          />
        </g>
      </svg>
      <p
        v-else
        class="mx-auto subtitle-1"
      >
        No Data Objects Loaded
      </p>
    </div>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { getImgSize } from '@/commons/utils';
import { calFittingTransform } from '@/commons/geometry';
import type {
  Category,
  IDataObject,
  ILabel,
} from '@/commons/types';
import TheImageOverviewHeader from './TheImageOverviewHeader.vue';

export default defineComponent({
  name: 'TheImageOverview',
  components: { TheImageOverviewHeader },
  props: {
    dataObjects: {
      type: Array as PropType<IDataObject[]>,
      required: true,
    },
    labels: {
      type: Array as PropType<ILabel[]>,
      required: true,
    },
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
  },
  emits: {
    'update:task-window': null,
  },
  data() {
    return { transform: '' };
  },
  computed: {
    src(): string | null {
      const { dataObjects } = this;
      if (dataObjects.length === 0) return null;
      return dataObjects[0].src;
    },
  },
  watch: {
    async src(): Promise<void> {
      this.transform = await this.getTransform();
    },
  },
  async mounted(): Promise<void> {
    this.transform = await this.getTransform();
  },
  methods: {
    async getTransform(): Promise<string> {
      const container = this.$refs.container as HTMLElement | undefined;
      const { src } = this;
      if (container === undefined || src === null) return '';
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const { width, height } = await getImgSize(src);
      const transform = calFittingTransform({
        xMin: 0,
        xMax: width,
        yMin: 0,
        yMax: height,
      }, containerWidth, containerHeight);
      return transform;
    },
    getColorByIdx(idx: number): string {
      const { labels, label2color, unlabeledMark } = this;
      if (label2color === null) return '';
      const label = labels[idx];
      if (label !== undefined && label.category !== undefined) return label2color(label.category);
      return label2color(unlabeledMark);
    },
  },
});
</script>

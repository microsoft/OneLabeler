<template>
  <div
    style="z-index: 1"
    :style="{ 'pointer-events': disabled ? 'none' : undefined }"
  >
    <svg
      ref="svg"
      style="width: 100%; height: 100%;"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { polygonContains } from 'd3';
import { Category, ILabel, ILabelPoints } from '@/commons/types';
import Lasso, { LassoEventType } from '@/plugins/d3.lasso';
import { MouseOperationType, ToolbarState } from './types';

type Polygon = [number, number][];

export default Vue.extend({
  name: 'BaseOverlay',
  props: {
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    toolbarState: {
      type: Object as PropType<ToolbarState>,
      default: null,
    },
    // Getter of the position of points.
    getPoints2d: {
      type: Function as PropType<() => ([number, number][] | null)>,
      required: true,
    },
  },
  computed: {
    pointLabels(): ILabelPoints | null {
      return this.label?.pointLabels ?? null;
    },
    mouseOperation(): MouseOperationType | string | null {
      return this.toolbarState?.mouseOperation ?? null;
    },
    strokeCategory(): Category | string | null {
      return this.toolbarState?.strokeCategory ?? null;
    },
    disabled(): boolean {
      return MouseOperationType.PaintBrush !== this.mouseOperation
        && MouseOperationType.PaintErase !== this.mouseOperation;
    },
  },
  mounted() {
    const svg = this.$refs.svg as SVGGElement;
    const lassoInstance = new Lasso();
    lassoInstance.on(LassoEventType.End, (polygon: Polygon) => {
      lassoInstance.removePath();
      this.onSegment3d(polygon);
    });
    lassoInstance.render(svg);
  },
  methods: {
    onSegment3d(polygon: Polygon): void {
      const points2d = this.getPoints2d();
      const { pointLabels } = this;
      if (points2d === null || pointLabels === null) return;

      const {
        mouseOperation,
        strokeCategory,
        unlabeledMark,
      } = this;

      let category = unlabeledMark;
      if (mouseOperation === MouseOperationType.PaintBrush) {
        category = strokeCategory ?? unlabeledMark;
      }
      const pointLabelsUpdated = [...pointLabels].map((d, i) => (
        polygonContains(polygon, points2d[i]) ? category : d
      ));
      this.$emit('upsert:label', { pointLabels: pointLabelsUpdated });
    },
  },
});
</script>

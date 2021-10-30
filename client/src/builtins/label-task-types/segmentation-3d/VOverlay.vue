<template>
  <div :style="{ 'pointer-events': disabled ? 'none' : undefined }">
    <svg
      ref="svg"
      style="width: 100%; height: 100%;"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Category } from '@/commons/types';
import Lasso, { LassoEventType } from '@/plugins/d3.lasso';
import { MouseOperationType, ToolbarState } from './types';

type Polygon = [number, number][];

export default Vue.extend({
  name: 'VSingleTool',
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
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
    onSegment3d: {
      type: Function as PropType<(polygon: Polygon, category: Category) => void>,
      required: true,
    },
  },
  computed: {
    mouseOperation(): MouseOperationType | string | null {
      return this.toolbarState?.mouseOperation ?? null;
    },
    strokeCategory(): Category | string | null {
      return this.toolbarState?.strokeCategory ?? null;
    },
    disabled(): boolean {
      return ![MouseOperationType.PaintBrush, MouseOperationType.PaintErase]
        .includes(this.mouseOperation);
    },
  },
  mounted() {
    const svg = this.$refs.svg as SVGGElement;
    const lassoInstance = new Lasso();
    lassoInstance.on(LassoEventType.End, (polygon: Polygon) => {
      lassoInstance.removePath();

      if (this.mouseOperation === MouseOperationType.PaintBrush) {
        this.onSegment3d(polygon, this.strokeCategory ?? this.unlabeledMark);
      }
      if (this.mouseOperation === MouseOperationType.PaintErase) {
        this.onSegment3d(polygon, this.unlabeledMark);
      }
    });
    lassoInstance.render(svg);
  },
});
</script>

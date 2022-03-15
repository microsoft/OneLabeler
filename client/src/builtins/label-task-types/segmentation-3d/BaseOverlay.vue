<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    ref="container"
    style="z-index: 1"
    :style="{ 'pointer-events': disabled ? 'none' : undefined }"
  >
    <svg style="width: 100%; height: 100%;">
      <VLasso
        :width="width"
        :height="height"
        @lasso:end="onSegment3d($event)"
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
import { useElementSize } from '@vueuse/core';
import { polygonContains } from 'd3';
import type { Category, ILabel, ILabelPoints } from '@/commons/types';
import VLasso from '@/plugins/lasso/VLasso.vue';
import { MouseOperationType } from './types';
import type { ToolbarState } from './types';

type Polygon = [number, number][];

export default defineComponent({
  name: 'BaseOverlay',
  components: { VLasso },
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
  emits: {
    'upsert:labels': null,
  },
  setup() {
    const container: Ref<HTMLElement | null> = ref(null);
    return {
      container,
      ...useElementSize(container),
    };
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
  methods: {
    onSegment3d(polygon: Polygon): void {
      const points2d = this.getPoints2d();
      if (points2d === null) return;
      const pointLabels: string[] = this.pointLabels
        ?? Array(points2d.length).fill(this.unlabeledMark);
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
      this.$emit('upsert:labels', { pointLabels: pointLabelsUpdated });
    },
  },
});
</script>

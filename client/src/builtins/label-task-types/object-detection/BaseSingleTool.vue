<template>
  <div style="display: flex">
    <!-- object shape toggle -->
    <VObjectShapeButtonToggle
      :categories="categories"
      :mouse-operation="mouseOperation"
      @set:mouse-operation="$emit('set:mouse-operation', $event)"
    />

    <!-- If segmentation is enabled, use the color menu of the segmentation toolbar. -->
    <template v-if="!includesSegmentation">
      <v-divider
        class="mx-2"
        vertical
      />

      <!-- stroke color menu -->
      <VStrokeColorMenu
        :categories="categories"
        :stroke-label="strokeLabel"
        :label2color="label2color"
        :disabled="mouseOperation === MouseOperationType.PanAndZoom
          || mouseOperation === MouseOperationType.EditShape
          || mouseOperation === MouseOperationType.PaintErase"
        @set:stroke-label="$emit('set:stroke-label', $event)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  LabelTaskType,
} from '@/commons/types';
import VStrokeColorMenu from '@/builtins/label-task-types/segmentation-2d/VStrokeColorMenu.vue';
import VObjectShapeButtonToggle from './VObjectShapeButtonToggle.vue';

export enum MouseOperationType {
  ClickCreatePolygon = 'ClickCreatePolygon',
  ClickCreateRect = 'ClickCreateRect',
  ClickCreatePoint = 'ClickCreatePoint',
  LassoCreatePolygon = 'LassoCreatePolygon',
  ScissorsCreatePolygon = 'ScissorsCreatePolygon',
}

export default Vue.extend({
  name: 'BaseSingleTool',
  components: {
    VStrokeColorMenu,
    VObjectShapeButtonToggle,
  },
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    mouseOperation: {
      type: String as PropType<MouseOperationType>,
      required: true,
    },
    strokeLabel: {
      type: String as PropType<Category | null>,
      default: null,
    },
  },
  data() {
    return { MouseOperationType };
  },
  computed: {
    includesSegmentation(): boolean {
      return this.labelTasks.includes(LabelTaskType.Segmentation2d);
    },
  },
});
</script>

<template>
  <div style="display: flex">
    <!-- object shape toggle -->
    <VObjectShapeButtonToggle
      :classes="classes"
      :mouse-operation="mouseOperation"
      @set:mouse-operation="onSetMouseOperation"
    />

    <!-- If segmentation is enabled, use the color menu of the segmentation toolbar. -->
    <template v-if="!includesSegmentation">
      <v-divider
        class="mx-2"
        vertical
      />

      <!-- stroke color menu -->
      <VStrokeColorMenu
        :classes="classes"
        :stroke-label="strokeLabel"
        :label2color="label2color"
        :disabled="mouseOperation === MouseOperationType.PanAndZoom
          || mouseOperation === MouseOperationType.EditShape
          || mouseOperation === MouseOperationType.PaintErase"
        @set:stroke-label="onSetStrokeLabel"
      />
    </template>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  ILabelCategory,
  LabelTaskType,
} from '@/commons/types';
import VStrokeColorMenu from '@/components/VLabelMask2D/VStrokeColorMenu.vue';
import VObjectShapeButtonToggle from './VObjectShapeButtonToggle.vue';

export enum MouseOperationType {
  ClickCreatePolygon = 'ClickCreatePolygon',
  ClickCreateRect = 'ClickCreateRect',
  ClickCreatePoint = 'ClickCreatePoint',
  LassoCreatePolygon = 'LassoCreatePolygon',
  ScissorsCreatePolygon = 'ScissorsCreatePolygon',
}

export default Vue.extend({
  name: 'VSingleTool',
  components: {
    VStrokeColorMenu,
    VObjectShapeButtonToggle,
  },
  props: {
    classes: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    mouseOperation: {
      type: String as PropType<MouseOperationType>,
      required: true,
    },
    strokeLabel: {
      type: String as PropType<ILabelCategory | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
  },
  data() {
    return { MouseOperationType };
  },
  computed: {
    includesSegmentation(): boolean {
      return this.labelTasks.includes(LabelTaskType.Segmentation);
    },
  },
  methods: {
    onSetMouseOperation(mouseOperation: MouseOperationType): void {
      this.$emit('set:mouse-operation', mouseOperation);
    },
    onSetStrokeLabel(strokeLabel: Category): void {
      this.$emit('set:stroke-label', strokeLabel);
    },
  },
});
</script>

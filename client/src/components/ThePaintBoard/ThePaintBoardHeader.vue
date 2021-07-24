<template>
  <VToolbar
    @window:minimize="$emit('window:minimize')"
    @window:pin="$emit('window:pin')"
  >
    <template #title>
      <VDataTypeIcon :data-type="dataType" />
      Sampled Object
    </template>
    <template #tools>
      <!-- reset image size button -->
      <v-btn
        title="reset image size"
        class="view-header-button ml-2"
        x-small
        icon
        @click="$emit('reset:image-size')"
      >
        <v-icon
          aria-hidden="true"
          class="px-0"
          small
        >
          $vuetify.icons.values.expand
        </v-icon>
      </v-btn>

      <v-divider
        class="mx-2"
        vertical
      />

      <!-- mouse operation mode toggle -->
      <v-btn-toggle
        :value="mouseOperationIndex"
        :mandatory="mouseOperationIndex !== null"
        class="view-header-button-toggle"
      >
        <v-btn
          v-for="btn in (includesSegmentation
            ? mouseOperationButtons : mouseOperationButtons.slice(0, 2))"
          :key="btn.mouseOperation"
          :title="btn.title"
          :disabled="btn.disabled"
          class="px-1"
          icon
          x-small
          @click="$emit('set:mouse-operation', btn.mouseOperation)"
        >
          <v-icon
            aria-hidden="true"
            small
          >
            {{ btn.icon }}
          </v-icon>
        </v-btn>
      </v-btn-toggle>

      <template v-if="includesObjectDetection">
        <v-divider
          class="mx-2"
          vertical
        />
        <VShapes2DSingleTool
          :classes="filterClassesByLabelTask(LabelTaskType.ObjectDetection)"
          :mouse-operation="mouseOperation"
          :stroke-label="strokeLabel"
          :label2color="label2color"
          :label-tasks="labelTasks"
          @set:mouse-operation="$emit('set:mouse-operation', $event)"
          @set:stroke-label="$emit('set:stroke-label', $event)"
        />
      </template>

      <template v-if="includesSegmentation">
        <v-divider
          class="mx-2"
          vertical
        />
        <VSegment2DSingleTool
          :classes="filterClassesByLabelTask(LabelTaskType.Segmentation)"
          :mouse-operation="mouseOperation"
          :stroke-label="strokeLabel"
          :stroke-shape="strokeShape"
          :stroke-width="strokeWidth"
          :label2color="label2color"
          @set:stroke-shape="$emit('set:stroke-shape', $event)"
          @set:stroke-width="$emit('set:stroke-width', $event)"
          @set:stroke-label="$emit('set:stroke-label', $event)"
        />
      </template>

      <template v-if="includesClassification">
        <v-divider
          class="mx-2"
          vertical
        />
        <!-- The data object label menu. -->
        <VCategorySingleTool
          :label-category="label === null ? null : label.category"
          :classes="filterClassesByLabelTask(LabelTaskType.Classification)"
          :button-color="label === null ? null : label2color(label.category)"
          :disabled="label === null"
          @set:label-category="$emit('set:label-category', $event)"
        />
      </template>

      <template v-if="includesMultiLabelClassification">
        <v-divider
          class="mx-2"
          vertical
        />
        <!-- The data object label menu. -->
        <VMultiCategorySingleTool
          :label-multi-category="label === null ? null : label.multiCategory"
          :classes="filterClassesByLabelTask(LabelTaskType.MultiLabelClassification)"
          :disabled="label === null"
          @set:label-multi-category="$emit('set:label-multi-category', $event)"
        />
      </template>

      <template v-if="includesFreeformText">
        <v-divider
          class="mx-2"
          vertical
        />
        <!-- The create/edit freeform text annotation button. -->
        <VFreeformTextSingleTool
          :label-text="label === null ? null : label.text"
          :disabled="label === null"
          @set:label-text="$emit('set:label-text', $event)"
        />
      </template>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  DataType,
  ILabel,
  LabelTaskType,
} from '@/commons/types';
import VDataTypeIcon from '@/components/VDataTypeIcon/VDataTypeIcon.vue';
import VToolbar from '@/components/VWindow/VToolbar.vue';
import VSegment2DSingleTool, {
  MouseOperationType as LabelMaskMouseOperationType,
  StrokeShapeType,
} from '@/components/VLabelMask2D/VSingleTool.vue';
import VShapes2DSingleTool, {
  MouseOperationType as LabelShapesMouseOperationType,
} from '@/components/VLabelShapes2D/VSingleTool.vue';
import VCategorySingleTool from '@/components/VLabelCategory/VSingleTool.vue';
import VMultiCategorySingleTool from '@/components/VLabelMultiCategory/VSingleTool.vue';
import VFreeformTextSingleTool from '@/components/VLabelFreeformText/VSingleTool.vue';

const MouseOperationType = {
  ...LabelMaskMouseOperationType,
  ...LabelShapesMouseOperationType,
};
// eslint-disable-next-line no-redeclare
type MouseOperationType = LabelMaskMouseOperationType | LabelShapesMouseOperationType;

export default Vue.extend({
  name: 'ThePaintBoardHeader',
  components: {
    VDataTypeIcon,
    VToolbar,
    VSegment2DSingleTool,
    VShapes2DSingleTool,
    VCategorySingleTool,
    VMultiCategorySingleTool,
    VFreeformTextSingleTool,
  },
  props: {
    dataType: {
      type: String as PropType<DataType>,
      required: true,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    classes: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
      required: true,
    },
    strokeLabel: {
      type: String as PropType<Category | null>,
      default: null,
    },
    strokeShape: {
      type: String as PropType<StrokeShapeType>,
      required: true,
    },
    strokeWidth: {
      type: Number as PropType<number>,
      required: true,
    },
    mouseOperation: {
      type: String as PropType<MouseOperationType>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(category: string) => string>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
  },
  data() {
    return { DataType, LabelTaskType };
  },
  computed: {
    includesObjectDetection(): boolean {
      return this.labelTasks.includes(LabelTaskType.ObjectDetection);
    },
    includesSegmentation(): boolean {
      return this.labelTasks.includes(LabelTaskType.Segmentation);
    },
    includesClassification(): boolean {
      return this.labelTasks.includes(LabelTaskType.Classification);
    },
    includesMultiLabelClassification(): boolean {
      return this.labelTasks.includes(LabelTaskType.MultiLabelClassification);
    },
    includesFreeformText(): boolean {
      return this.labelTasks.includes(LabelTaskType.FreeformText);
    },
    classesNotEmpty(): boolean {
      return this.classes.length !== 0;
    },
    mouseOperationButtons(): {
      title: string,
      icon: any,
      mouseOperation: MouseOperationType,
      disabled: boolean,
      }[] {
      return [
        {
          title: 'pan & zoom',
          icon: this.$vuetify.icons.values.pan,
          mouseOperation: MouseOperationType.PanAndZoom,
          disabled: false,
        },
        {
          title: 'edit shape',
          icon: this.$vuetify.icons.values.hand,
          mouseOperation: MouseOperationType.EditShape,
          disabled: !this.classesNotEmpty,
        },
        {
          title: 'paint',
          icon: this.$vuetify.icons.values.paint,
          mouseOperation: MouseOperationType.PaintBrush,
          disabled: !this.classesNotEmpty,
        },
        {
          title: 'eraser',
          icon: this.$vuetify.icons.values.eraser,
          mouseOperation: MouseOperationType.PaintErase,
          disabled: !this.classesNotEmpty,
        },
      ];
    },
    mouseOperationIndex(): number | null {
      const { mouseOperation, mouseOperationButtons } = this;
      const index = mouseOperationButtons
        .findIndex((d) => d.mouseOperation === mouseOperation);
      if (index === -1) return null;
      return index;
    },
  },
  methods: {
    filterClassesByLabelTask(labelTask: LabelTaskType): Category[] {
      const { categoryTasks } = this;
      const classesFiltered: Category[] = Object.entries(categoryTasks)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([category, usedInTasks]) => (
          usedInTasks === null || usedInTasks.includes(labelTask)
        )).map((d) => d[0]);
      return classesFiltered;
    },
  },
});
</script>

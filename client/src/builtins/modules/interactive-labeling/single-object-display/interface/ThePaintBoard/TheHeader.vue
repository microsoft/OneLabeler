<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

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
        class="card-header-button ml-2"
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
        class="mx-1"
        vertical
      />

      <!-- mouse operation mode toggle -->
      <v-btn-toggle
        :value="mouseOperationIndex"
        :mandatory="mouseOperationIndex !== null"
        class="card-header-button-toggle"
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

      <!-- The toolbars for each label task. -->
      <template v-for="(setup, i) in taskSetups">
        <v-divider
          :key="`${i}-divider`"
          class="mx-1"
          vertical
        />
        <component
          :is="setup.singleTool"
          :key="`${i}-tool`"
          :data-type="dataType"
          :label-tasks="labelTasks"
          :label="label"
          :categories="filterCategoriesByLabelTask(setup.type)"
          :label2color="label2color"
          :disabled="label === null"
          :mouse-operation="mouseOperation"
          :stroke-label="strokeLabel"
          :stroke-shape="strokeShape"
          :stroke-width="strokeWidth"
          @upsert:labels="$emit('upsert:labels', $event)"
          @set:mouse-operation="$emit('set:mouse-operation', $event)"
          @set:stroke-label="$emit('set:stroke-label', $event)"
          @set:stroke-shape="$emit('set:stroke-shape', $event)"
          @set:stroke-width="$emit('set:stroke-width', $event)"
        />
      </template>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { LabelTaskType } from '@/commons/types';
import type {
  Category,
  DataType,
  ILabel,
  ILabelTaskTypeSetup,
} from '@/commons/types';
import VDataTypeIcon from '@/components/VDataTypeIcon/VDataTypeIcon.vue';
import VToolbar from '@/components/VWindow/VToolbar.vue';
import {
  MouseOperationType as LabelMaskMouseOperationType,
  StrokeShapeType,
} from '@/builtins/label-task-types/segmentation-2d/BaseSingleTool.vue';
import {
  MouseOperationType as LabelShapesMouseOperationType,
} from '@/builtins/label-task-types/object-detection/BaseSingleTool.vue';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';

const MouseOperationType = {
  ...LabelMaskMouseOperationType,
  ...LabelShapesMouseOperationType,
};
// eslint-disable-next-line no-redeclare
type MouseOperationType = LabelMaskMouseOperationType | LabelShapesMouseOperationType;

type MouseOperationButton = {
  title: string;
  icon: string;
  mouseOperation: MouseOperationType;
  disabled: boolean;
}

export default defineComponent({
  name: 'ThePaintBoardHeader',
  components: { VDataTypeIcon, VToolbar },
  props: {
    dataType: {
      type: String as PropType<DataType>,
      // In case the interface is created before data type is selected.
      default: null,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(category: string) => string>,
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
  },
  emits: {
    'window:minimize': null,
    'window:pin': null,
    'reset:image-size': null,
    'set:mouse-operation': null,
    'upsert:labels': null,
    'set:stroke-label': null,
    'set:stroke-shape': null,
    'set:stroke-width': null,
  },
  computed: {
    taskSetups(): ILabelTaskTypeSetup[] {
      const { labelTasks } = this;
      return labelTaskTypeSetups
        .filter((d) => (labelTasks as string[]).includes(d.type))
        .filter((d) => d.singleTool !== undefined);
    },
    includesSegmentation(): boolean {
      return this.labelTasks.includes(LabelTaskType.Segmentation2d);
    },
    categories(): Category[] {
      const { categoryTasks } = this;
      return Object.keys(categoryTasks)
        .filter((d) => d !== null && d !== undefined);
    },
    categoriesNotEmpty(): boolean {
      return this.categories.length !== 0;
    },
    mouseOperationButtons(): MouseOperationButton[] {
      const { categoriesNotEmpty } = this;
      return [
        {
          title: 'pan & zoom',
          icon: this.$vuetify.icons.values.pan as string,
          mouseOperation: MouseOperationType.PanAndZoom,
          disabled: false,
        },
        {
          title: 'edit shape',
          icon: this.$vuetify.icons.values.hand as string,
          mouseOperation: MouseOperationType.EditShape,
          disabled: !categoriesNotEmpty,
        },
        {
          title: 'paint',
          icon: this.$vuetify.icons.values.paint as string,
          mouseOperation: MouseOperationType.PaintBrush,
          disabled: !categoriesNotEmpty,
        },
        {
          title: 'eraser',
          icon: this.$vuetify.icons.values.eraser as string,
          mouseOperation: MouseOperationType.PaintErase,
          disabled: !categoriesNotEmpty,
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
    filterCategoriesByLabelTask(labelTask: LabelTaskType): Category[] {
      return Object.entries(this.categoryTasks)
        .filter(([, usedInTasks]) => (
          usedInTasks === null || usedInTasks.includes(labelTask)
        )).map((d) => d[0]);
    },
  },
});
</script>

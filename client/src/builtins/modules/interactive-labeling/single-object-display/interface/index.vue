<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <component
    :is="component"
    :data-objects="dataObjects"
    :labels="labels"
    :statuses="statuses"
    :task-window="taskWindow"
    :data-type="dataType"
    :label-tasks="labelTasks"
    :category-tasks="categoryTasks"
    :unlabeled-mark="unlabeledMark"
    :label2color="label2color"
    @upsert:labels="$emit('upsert:labels', $event)"
    @upsert-bulk:labels="$emit('upsert-bulk:labels', $event)"
    @update:task-window="$emit('update:task-window', $event)"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { VueConstructor } from 'vue';
import { DataType } from '@/commons/types';
import type {
  Category,
  IDataObject,
  ILabel,
  LabelTaskType,
  StatusType,
  TaskWindow,
} from '@/commons/types';
import ThePaintBoard from './ThePaintBoard/index.vue';
import TheSingleObjectBoard from './TheSingleObjectBoard/index.vue';
import TheTimeSpanBoard from './TheTimeSpanBoard/index.vue';

export default defineComponent({
  name: 'TheSingleObjectDisplay',
  props: {
    dataObjects: {
      type: Array as PropType<IDataObject[]>,
      required: true,
    },
    labels: {
      type: Array as PropType<ILabel[]>,
      required: true,
    },
    statuses: {
      type: Array as PropType<StatusType[]>,
      required: true,
    },
    taskWindow: {
      type: Object as PropType<TaskWindow>,
      required: true,
    },
    dataType: {
      type: String as PropType<DataType>,
      // In case the interface is created before data type is selected.
      default: null,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
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
    'upsert:labels': null,
    'upsert-bulk:labels': null,
    'update:task-window': null,
  },
  computed: {
    component(): VueConstructor | null {
      const { dataType } = this;
      if (dataType === DataType.Image) return ThePaintBoard;
      if (dataType === DataType.Video) return TheTimeSpanBoard;
      if (dataType === DataType.YoutubeVideo) return TheTimeSpanBoard;
      if (dataType === DataType.Audio) return TheTimeSpanBoard;
      return TheSingleObjectBoard;
    },
  },
});
</script>

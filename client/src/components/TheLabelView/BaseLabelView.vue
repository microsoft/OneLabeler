<template>
  <component
    :is="component"
    v-if="ready"
    :data-objects="filteredDataObjects"
    :labels="filteredLabels"
    :statuses="filteredStatuses.map((d) => d.value)"
    :task-window="taskWindow"
    :label-tasks="labelTasks"
    :data-type="dataType"
    :category-tasks="categoryTasks"
    :unlabeled-mark="unlabeledMark"
    :label2color="label2color"
    @upsert:labels="$emit('upsert:labels', $event)"
    @upsert-bulk:labels="$emit('upsert-bulk:labels', $event)"
    @update:task-window="$emit('update:task-window', $event)"
  />
</template>

<script lang="ts">
import type { VueConstructor } from 'vue';
import { defineComponent, ref, toRefs } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import {
  Category,
  DataType,
  LabelTaskType,
  WorkflowNodeType,
} from '@/commons/types';
import type {
  IDataObjectStorage,
  ILabelStorage,
  IStatusStorage,
  TaskWindow,
} from '@/commons/types';
import TheGridMatrix from '@/components/TheGridMatrix/TheGridMatrix.vue';
import TheSingleObjectDisplay from '@/components/TheSingleObjectDisplay/TheSingleObjectDisplay.vue';
import {
  useFilteredDataObjects,
  useFilteredLabels,
  useFilteredStatuses,
} from '@/components/composables/useFilteredStorage';

export default defineComponent({
  name: 'TheLabelView',
  props: {
    taskWindow: {
      type: Object as PropType<TaskWindow>,
      required: true,
    },
    dataObjects: {
      type: Object as PropType<IDataObjectStorage | null>,
      default: null,
    },
    labels: {
      type: Object as PropType<ILabelStorage | null>,
      default: null,
    },
    statuses: {
      type: Object as PropType<IStatusStorage | null>,
      default: null,
    },
    queryUuids: {
      type: Array as PropType<string[]>,
      required: true,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[]>>,
      required: true,
    },
    unlabeledMark: {
      type: String as PropType<string>,
      required: true,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
    dataType: {
      type: String as PropType<DataType | null>,
      default: null,
    },
    labelTasks: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  emits: {
    'upsert:labels': null,
    'upsert-bulk:labels': null,
    'update:task-window': null,
  },
  setup(props) {
    const {
      dataObjects,
      labels,
      statuses,
      queryUuids,
    } = toRefs(props);
    return {
      ...useFilteredDataObjects(dataObjects, queryUuids),
      ...useFilteredLabels(dataObjects, labels, queryUuids, ref(false)),
      ...useFilteredStatuses(dataObjects, statuses, queryUuids, ref(false)),
    };
  },
  computed: {
    component(): VueConstructor | null {
      const { node, process } = this.taskWindow;
      if (node.type !== WorkflowNodeType.InteractiveLabeling) return null;
      if (process.api === 'SingleObjectDisplay') return TheSingleObjectDisplay;
      if (process.api === 'GridMatrix') return TheGridMatrix;
      return null;
    },
    ready(): boolean {
      return (this.filteredDataObjects.length === this.filteredLabels.length)
       && (this.filteredDataObjects.length === this.filteredStatuses.length);
    },
  },
});
</script>

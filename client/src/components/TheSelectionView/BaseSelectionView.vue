<template>
  <component
    :is="component"
    :data-objects="filteredDataObjects"
    :labels="filteredLabels"
    :query-uuids="filteredQueryUuids"
    :unlabeled-mark="unlabeledMark"
    :label2color="label2color"
    :feature-names="featureNames"
    :task-window="taskWindow"
    @set:query-uuids="$emit('set:query-uuids', $event)"
    @update:task-window="$emit('update:task-window', $event)"
  />
</template>

<script lang="ts">
import type { VueConstructor } from 'vue';
import { defineComponent, toRefs } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { WorkflowNodeType } from '@/commons/types';
import type {
  IDataObjectStorage,
  ILabelStorage,
  TaskWindow,
} from '@/commons/types';
import TheImageOverview from '@/components/TheImageOverview/TheImageOverview.vue';
import TheProjectionView from '@/components/TheProjectionView/TheProjectionView.vue';
import {
  useFilteredDataObjects,
  useFilteredLabels,
} from '@/components/composables/useFilteredStorage';

export default defineComponent({
  name: 'BaseSelectionView',
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
    queryUuids: {
      type: Array as PropType<string[]>,
      required: true,
    },
    scopeUuids: {
      type: Array as PropType<string[] | null>,
      default: null,
    },
    unlabeledMark: {
      type: String as PropType<string>,
      required: true,
    },
    featureNames: {
      type: Array as PropType<string[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
  },
  setup(props) {
    const {
      dataObjects,
      labels,
      scopeUuids,
    } = toRefs(props);
    return {
      ...useFilteredDataObjects(dataObjects, scopeUuids),
      ...useFilteredLabels(dataObjects, labels, scopeUuids),
    };
  },
  computed: {
    component(): VueConstructor | null {
      const { node, process } = this.taskWindow;
      if (node.type !== WorkflowNodeType.DataObjectSelection) return null;
      if (process.api === 'Projection') return TheProjectionView;
      if (process.api === 'ImageOverview') return TheImageOverview;
      return null;
    },
    filteredQueryUuids(): string[] {
      const { scopeUuids, queryUuids } = this;
      if (scopeUuids === null) return queryUuids;
      return queryUuids.filter((d) => scopeUuids.includes(d));
    },
  },
});
</script>
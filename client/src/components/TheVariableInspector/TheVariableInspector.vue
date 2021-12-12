<template>
  <BaseVariableInspector
    :data-objects="dataObjects"
    :labels="labels"
    :query-uuids="queryUuids"
    :categories="categories"
    :stop="stop"
    :models="models"
    :scope-uuids="scopeUuids"
  />
</template>

<script lang="ts">
import { mapGetters, mapState } from 'vuex';
import modelServices from '@/builtins/model-services';
import type {
  Category,
  LabelTaskType,
  ModelService,
  WorkflowNode,
} from '@/commons/types';
import BaseVariableInspector from './BaseVariableInspector.vue';

const isOverlapping = (a: Set<unknown>, b: Set<unknown>): boolean => {
  const delta = new Set([...a, ...b]).size - a.size - b.size;
  return delta !== 0;
};

export default {
  name: 'TheVariableInspector',
  components: { BaseVariableInspector },
  computed: {
    ...mapState([
      'dataObjects',
      'labels',
      'queryUuids',
      'stop',
      'categoryTasks',
      'scopeUuids',
    ]),
    ...mapState('workflow', ['nodes']),
    ...mapGetters('workflow', ['labelTasks']),
    categories(): Category[] {
      const categoryTasks = this.categoryTasks as Record<Category, LabelTaskType[]>;
      const labelTasks = this.labelTasks as LabelTaskType[];
      return Object.entries(categoryTasks)
        .filter(([, usedInTasks]) => (
          usedInTasks === null || isOverlapping(new Set(usedInTasks), new Set(labelTasks))
        )).map((d) => d[0]);
    },
    models(): ModelService[] {
      const nodes = this.nodes as WorkflowNode[];
      if (nodes === undefined) return [];
      const usedModels = modelServices.filter((d) => (
        nodes.map((n) => n.value?.model?.objectId).includes(d.objectId)
      ));
      return usedModels;
    },
  },
};
</script>

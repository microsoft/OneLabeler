<template>
  <component
    :is="component"
    :methods="methods"
    :models="models"
    :node="node"
    :edge="edge"
    @edit:node="$emit('edit:node', $event)"
    @create:method="$emit('create:method', $event)"
    @edit:method="$emit('edit:method', $event)"
    @create:model="$emit('create:model', $event)"
    @edit:model="$emit('edit:model', $event)"
  />
</template>

<script lang="ts">
import type { PropType, VueConstructor } from 'vue';
import type {
  ModelService,
  Process,
  WorkflowEdge,
  WorkflowNode,
} from '@/commons/types';
import TheEdgeDetails from './TheEdgeDetails.vue';
import TheElementDetailsSelectionEmpty from './TheElementDetailsSelectionEmpty.vue';
import TheElementDetailsSelectionMultiple from './TheElementDetailsSelectionMultiple.vue';
import TheNodeDetails from './TheNodeDetails.vue';

const isElementNode = (
  element: WorkflowNode | WorkflowEdge,
): boolean => 'type' in element;

export default {
  name: 'TheElementDetails',
  props: {
    methods: {
      type: Array as PropType<Process[]>,
      default: () => [],
    },
    models: {
      type: Array as PropType<ModelService[]>,
      default: () => [],
    },
    /** The list of selected nodes and edges. */
    selection: {
      type: Array as PropType<(WorkflowNode | WorkflowEdge)[]>,
      default: () => [],
    },
  },
  computed: {
    node(): WorkflowNode | null {
      const { selection } = this;
      if (selection.length !== 1) return null;
      const [element] = selection;
      return isElementNode(element) ? (element as WorkflowNode) : null;
    },
    edge(): WorkflowEdge | null {
      const { selection } = this;
      if (selection.length !== 1) return null;
      const [element] = selection;
      return isElementNode(element) ? null : (element as WorkflowEdge);
    },
    component(): VueConstructor {
      const { edge, node, selection } = this;
      if (selection.length === 0) return TheElementDetailsSelectionEmpty;
      if (selection.length >= 2) return TheElementDetailsSelectionMultiple;
      if (node !== null) return TheNodeDetails;
      if (edge !== null) return TheEdgeDetails;
      return TheElementDetailsSelectionEmpty;
    },
  },
};
</script>

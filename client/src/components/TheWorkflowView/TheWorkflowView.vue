<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    :style="styleCardElevated"
    style="display: flex; flex-direction: column;"
  >
    <TheWorkflowViewHeader />
    <v-divider />
    <!-- The graph canvas. -->
    <TheWorkflowViewBody
      :graph="{ nodes, edges }"
      :current-node="currentNode"
      :selected-node-ids="selectedNodeIds"
      :selected-edge-ids="selectedEdgeIds"
      :hovered-node-ids="hoveredNodeIds"
      :hovered-edge-ids="hoveredEdgeIds"
      style="flex: 1 1 auto"
      @create:node="pushNodes($event)"
      @edit:node="editNode($event)"
      @remove:node="onRemoveNode"
      @goto:node="setCurrentNode($event)"
      @execute-from:node="onExecuteFromNode"
      @execute-1-step-from:node="onExecuteOneStepFromNode"
      @create:edge="pushEdges($event)"
      @edit:edge="editEdge($event)"
      @remove:edge="removeEdge($event)"
      @update:selectedNodeIds="$emit('update:selectedNodeIds', $event)"
      @update:selectedEdgeIds="$emit('update:selectedEdgeIds', $event)"
      @update:hoveredNodeIds="$emit('update:hoveredNodeIds', $event)"
      @update:hoveredEdgeIds="$emit('update:hoveredEdgeIds', $event)"
    />
  </div>
</template>

<script lang="ts">
import { mapActions, mapState } from 'vuex';
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { WorkflowEdge, WorkflowNode } from '@/commons/types';
import { cardElevated as styleCardElevated } from '@/style';
import TheWorkflowViewHeader from './TheWorkflowViewHeader.vue';
import TheWorkflowViewBody from './TheWorkflowViewBody.vue';

export default defineComponent({
  name: 'TheWorkflowView',
  components: {
    TheWorkflowViewHeader,
    TheWorkflowViewBody,
  },
  props: {
    selectedNodeIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    selectedEdgeIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    hoveredNodeIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    hoveredEdgeIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  emits: {
    'update:selectedNodeIds': null,
    'update:selectedEdgeIds': null,
    'update:hoveredNodeIds': null,
    'update:hoveredEdgeIds': null,
  },
  data() {
    return { styleCardElevated };
  },
  computed: {
    ...mapState('workflow', [
      'currentNode',
      'nodes',
      'edges',
    ]),
  },
  methods: {
    ...mapActions('workflow', [
      'setCurrentNode',
      'pushNodes',
      'editNode',
      'removeNode',
      'pushEdges',
      'editEdge',
      'removeEdge',
      'executeWorkflow',
    ]),
    onRemoveNode(node: WorkflowNode): void {
      const { edges } = this;
      edges.forEach((edge: WorkflowEdge) => {
        if (edge.source === node.id || edge.target === node.id) this.removeEdge(edge);
      });
      this.removeNode(node);
    },
    onExecuteFromNode(node: WorkflowNode): void {
      this.setCurrentNode(node);
      this.executeWorkflow({ node });
    },
    onExecuteOneStepFromNode(node: WorkflowNode): void {
      this.setCurrentNode(node);
      this.executeWorkflow({ node, recursive: false });
    },
  },
});
</script>

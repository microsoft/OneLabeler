<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div style="display: flex; gap: 4px;">
    <template v-if="showStartPage">
      <TheGetStartedView
        style="flex: 1 1 auto"
        v-on="$listeners"
      />
    </template>
    <template v-else>
      <div
        style="flex: 1 1 60%; display: grid; grid-template-rows: repeat(3, 1fr);"
      >
        <TheWorkflowView
          style="grid-area: 1 / 1 / 4 / 2"
          :selected-node-ids.sync="selectedNodeIds"
          :selected-edge-ids.sync="selectedEdgeIds"
          :hovered-node-ids.sync="hoveredNodeIds"
          :hovered-edge-ids.sync="hoveredEdgeIds"
        />

        <!-- The graph grammar checking console. -->
        <TheConsoleView
          :graph="{ nodes, edges }"
          style="margin: 4px; grid-area: 3 / 1 / 4 / 2; min-height: 0px;"
          @select:nodes="selectedNodeIds = $event"
          @select:edges="selectedEdgeIds = $event"
          @hover:nodes="hoveredNodeIds = $event"
          @hover:edges="hoveredEdgeIds = $event"
        />
      </div>

      <!-- The workflow element setting panel. -->
      <TheElementDetails
        v-if="showElementSettings"
        :methods="validModules"
        :models="modelServices"
        :selection="selection"
        style="flex: 0 1 30%"
        @edit:node="editNode($event)"
        @create:module="pushModules($event)"
        @update:module="editModule($event)"
        @create:model="pushModelServices($event)"
        @edit:model="editModelService($event)"
        @edit:edge="editEdge($event)"
      />

      <!-- The variable inspector. -->
      <TheVariableInspector
        v-if="showInspector"
        style="flex: 0 1 30%"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { mapActions, mapGetters, mapState } from 'vuex';
import type { WorkflowEdge, WorkflowNode } from '@/commons/types';
import TheElementDetails from '../TheElementDetails/TheElementDetails.vue';
import TheWorkflowView from '../TheWorkflowView/TheWorkflowView.vue';
import TheConsoleView from '../TheConsoleView/TheConsoleView.vue';
import TheVariableInspector from '../TheVariableInspector/TheVariableInspector.vue';
import TheGetStartedView from '../TheGetStartedView/TheGetStartedView.vue';

export default defineComponent({
  name: 'TheDevPanelProjectWorkflow',
  components: {
    TheElementDetails,
    TheWorkflowView,
    TheConsoleView,
    TheVariableInspector,
    TheGetStartedView,
  },
  props: {
    showElementSettings: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    showInspector: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    showStartPage: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      // Note: store the node/edge ids instead of directly storing the nodes/edges
      // in case the node/edge properties stored in the child component is not up to date.
      selectedNodeIds: [] as string[],
      selectedEdgeIds: [] as string[],
      hoveredNodeIds: [] as string[],
      hoveredEdgeIds: [] as string[],
    };
  },
  computed: {
    ...mapState('workflow', [
      'nodes',
      'edges',
      'modelServices',
    ]),
    ...mapGetters('workflow', ['validModules']),
    selection(): (WorkflowNode | WorkflowEdge)[] {
      // Note: make the selection computed instead of directly stored
      // to ensure the selection is updated when the nodes/edges are modified.
      const nodes = this.nodes as WorkflowNode[];
      const edges = this.edges as WorkflowEdge[];
      const { selectedNodeIds, selectedEdgeIds } = this;
      const selectedNodes = selectedNodeIds.map((d) => (
        nodes.find((node) => node.id === d) as WorkflowNode
      ));
      const selectedEdges = selectedEdgeIds.map((d) => (
        edges.find((edge) => edge.id === d) as WorkflowEdge
      ));
      return [
        ...selectedNodes,
        ...selectedEdges,
      ];
    },
  },
  methods: {
    ...mapActions('workflow', [
      'pushModelServices',
      'editModelService',
      'editNode',
      'pushModules',
      'editModule',
      'editEdge',
    ]),
  },
});
</script>

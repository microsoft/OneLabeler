<template>
  <div style="display: flex">
    <v-card
      class="mr-1"
      style="flex-basis: 60%;"
      tile
    >
      <div class="view-header">
        <v-icon
          class="px-2"
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.flowChart
        </v-icon>
        Workflow Graph
      </div>
      <v-divider />
      <div>
        <!-- The graph canvas. -->
        <TheWorkflowGraphViewCanvas
          :graph="{ nodes, edges }"
          :current-node="currentNode"
          @create:node="onCreateNode"
          @edit:node="onEditNode"
          @remove:node="onRemoveNode"
          @select:nodes="onSelectNodes"
          @jumpto:node="onJumpToNode"
          @flowfrom:node="onFlowFromNode"
          @create:edge="onCreateEdge"
          @remove:edge="onRemoveEdge"
          @select:edges="onSelectEdges"
        />
        <!-- The graph grammar checking console. -->
        <TheWorkflowGraphViewConsole
          :graph="{ nodes, edges }"
          :style="{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            height: '200px',
          }"
          @select:nodes="onSelectNodes"
          @select:edges="onSelectEdges"
        />
      </div>
    </v-card>
    <div style="display: flex; flex-direction: column; flex-basis: 40%;">
      <div style="flex: 1 1 100%;">
        <!-- The process parameter panel. -->
        <TheElementDetails
          :methods="processesValid"
          :models="modelServices"
          :selection="selection"
          @edit:node="onEditNode"
          @create:method="onCreateMethod"
          @edit:method="onEditMethod"
          @create:model="onCreateModel"
          @edit:model="onEditModel"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import {
  ModelService,
  Process,
  WorkflowEdge,
  WorkflowNode,
} from '@/commons/types';
// import TheDataManagementView from '../TheDataManagementView/TheDataManagementView.vue';
import TheElementDetails from '../TheWorkflowNodeDetails/TheElementDetails.vue';
import TheWorkflowGraphViewCanvas from './TheWorkflowGraphViewCanvas.vue';
import TheWorkflowGraphViewConsole from './TheWorkflowGraphViewConsole.vue';

export default Vue.extend({
  name: 'TheWorkflowGraphView',
  components: {
    // TheDataManagementView,
    TheElementDetails,
    TheWorkflowGraphViewCanvas,
    TheWorkflowGraphViewConsole,
  },
  data() {
    return {
      selectedNodeIds: [] as string[],
      selectedEdgeIds: [] as string[],
    };
  },
  computed: {
    ...mapState('workflow', [
      'currentNode',
      'nodes',
      'edges',
      'modelServices',
    ]),
    ...mapGetters('workflow', ['processesValid']),
    selection(): (WorkflowNode | WorkflowEdge)[] {
      // Note: make the selection computed instead of directly stored
      // to ensure the selection is updated when the nodes/edges are modified.
      const {
        nodes,
        edges,
        selectedNodeIds,
        selectedEdgeIds,
      } = this;
      const selectedNodes = selectedNodeIds.map((d) => (
        (nodes as WorkflowNode[]).find((node) => node.id === d) as WorkflowNode
      ));
      const selectedEdges = selectedEdgeIds.map((d) => (
        (edges as WorkflowEdge[]).find((edge) => edge.id === d) as WorkflowEdge
      ));
      return [
        ...selectedNodes,
        ...selectedEdges,
      ];
    },
  },
  methods: {
    ...mapActions('workflow', [
      'setCurrentNode',
      'pushModelServices',
      'editModelService',
      'pushNodes',
      'editNode',
      'removeNode',
      'pushEdges',
      'removeEdge',
      'pushProcesses',
      'editProcess',
      'executeWorkflow',
    ]),
    onCreateNode(node: WorkflowNode) {
      this.pushNodes(node);
    },
    onEditNode(newValue: WorkflowNode) {
      this.editNode(newValue);
    },
    onRemoveNode(node: WorkflowNode) {
      const { edges } = this;
      edges.forEach((edge: WorkflowEdge) => {
        const { source, target } = edge;
        const shouldRemove = source === node.id || target === node.id;
        if (shouldRemove) this.removeEdge(edge);
      });
      this.removeNode(node);
    },
    onSelectNodes(ids: string[]) {
      this.selectedNodeIds = ids;
    },
    onJumpToNode(node: WorkflowNode) {
      this.setCurrentNode(node);
    },
    onFlowFromNode(node: WorkflowNode) {
      this.setCurrentNode(node);
      this.executeWorkflow(node);
    },
    onCreateEdge(edge: WorkflowEdge) {
      this.pushEdges(edge);
    },
    onRemoveEdge(edge: WorkflowEdge) {
      this.removeEdge(edge);
    },
    onSelectEdges(ids: string[]) {
      this.selectedEdgeIds = ids;
    },
    onEditMethod(newValue: Process) {
      this.editProcess(newValue);
    },
    onCreateMethod(newValue: Process) {
      this.pushProcesses(newValue);
    },
    onEditModel(newValue: ModelService) {
      this.editModelService(newValue);
    },
    onCreateModel(newValue: ModelService) {
      this.pushModelServices(newValue);
    },
  },
});
</script>

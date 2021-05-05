<template>
  <!-- The configuration menus. -->
  <v-container
    class="pa-0"
    style="max-width: 1700px"
  >
    <v-row no-gutters>
      <v-col
        class="pr-1"
        style="flex-basis: 60%;"
      >
        <v-card
          tile
        >
          <v-card-title
            class="view-header"
          >
            <v-icon
              class="px-2"
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.flowChart
            </v-icon>
            Workflow Graph
          </v-card-title>
          <v-divider />
          <v-card-actions class="pa-0">
            <!-- The graph canvas. -->
            <TheWorkflowGraphViewCanvas
              :graph="{ nodes, edges }"
              @create:node="onCreateNode"
              @edit:node="onEditNode"
              @remove:node="onRemoveNode"
              @select:nodes="onSelectNodes"
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
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col
        class="pl-1"
        style="flex-basis: 40%;"
      >
        <!-- The process parameter panel. -->
        <TheElementDetails
          :methods="processes"
          :models="modelServices"
          :selection="selection"
          @edit:node="onEditNode"
          @create:method="onCreateMethod"
          @edit:method="onEditMethod"
          @create:model="onCreateModel"
          @edit:model="onEditModel"
          @click:recompute="onClickRecompute"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import {
  ModelService,
  Process,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import TheWorkflowGraphViewCanvas from './TheWorkflowGraphViewCanvas.vue';
import TheWorkflowGraphViewConsole from './TheWorkflowGraphViewConsole.vue';
import TheElementDetails from '../TheWorkflowNodeDetails/TheElementDetails.vue';

export default Vue.extend({
  name: 'TheWorkflowGraphView',
  components: {
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
      'nodes',
      'edges',
      'modelServices',
      'processes',
    ]),
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
      'pushNodes',
      'editNode',
      'removeNode',
      'pushEdges',
      'removeEdge',
      'pushProcesses',
      'editProcess',
      'executeDataObjectSelectionAlgorithmic',
      'executeDefaultLabeling',
      'executeFeatureExtraction',
      'executeInterimModelTraining',
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
    onClickRecompute(node: WorkflowNode) {
      if (node.type === WorkflowNodeType.DataObjectSelection) {
        this.executeDataObjectSelectionAlgorithmic(node.value);
      }
      if (node.type === WorkflowNodeType.DefaultLabeling) {
        this.executeDefaultLabeling(node.value);
      }
      if (node.type === WorkflowNodeType.FeatureExtraction) {
        this.executeFeatureExtraction(node.value);
      }
      if (node.type === WorkflowNodeType.InterimModelTraining) {
        this.executeInterimModelTraining(node.value);
      }
    },
  },
});
</script>

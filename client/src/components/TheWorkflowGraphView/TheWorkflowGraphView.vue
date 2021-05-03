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
              @click:node="onSelectNode"
              @create:node="onCreateNode"
              @edit:node="onEditNode"
              @remove:node="onRemoveNode"
              @create:edge="onCreateEdge"
              @remove:edge="onRemoveEdge"
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
              @select:node="onSelectNode"
            />
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col
        class="pl-1"
        style="flex-basis: 40%;"
      >
        <!-- The process parameter panel. -->
        <TheNodeDetails
          :methods="processes"
          :models="modelServices"
          :node="selectedNode"
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
import TheNodeDetails from '../TheWorkflowNodeDetails/TheNodeDetails.vue';

export default Vue.extend({
  name: 'TheWorkflowGraphView',
  components: {
    TheNodeDetails,
    TheWorkflowGraphViewCanvas,
    TheWorkflowGraphViewConsole,
  },
  data() {
    return {
      selectedNode: null as null | WorkflowNode,
    };
  },
  computed: {
    ...mapState('workflow', [
      'nodes',
      'edges',
      'modelServices',
      'processes',
    ]),
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
    onSelectNode(node: WorkflowNode) {
      this.selectedNode = node;
    },
    onCreateNode(node: WorkflowNode) {
      this.pushNodes(node);
    },
    onEditNode(newValue: WorkflowNode) {
      this.editNode(newValue);
      this.selectedNode = newValue;
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
    onCreateEdge(edge: WorkflowEdge) {
      this.pushEdges(edge);
    },
    onRemoveEdge(edge: WorkflowEdge) {
      this.removeEdge(edge);
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

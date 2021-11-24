<template>
  <div style="display: flex">
    <v-card
      class="mr-1"
      style="flex-basis: 60%; display: flex; flex-direction: column;"
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
        Workflow
      </div>
      <v-divider />
      <div style="display: flex; flex: 1 1 auto;">
        <!-- The graph canvas. -->
        <TheDevPanelBodyCanvas
          :graph="{ nodes, edges }"
          :current-node="currentNode"
          style="flex: 1 1 auto"
          @create:node="pushNodes($event)"
          @edit:node="editNode($event)"
          @remove:node="onRemoveNode"
          @select:nodes="onSelectNodes"
          @jumpto:node="setCurrentNode($event)"
          @flowfrom:node="onFlowFromNode"
          @create:edge="pushEdges($event)"
          @remove:edge="removeEdge($event)"
          @select:edges="onSelectEdges"
        />
        <!-- The graph grammar checking console. -->
        <TheDevPanelBodyConsole
          :graph="{ nodes, edges }"
          :style="{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            height: '35%',
          }"
          @select:nodes="onSelectNodes"
          @select:edges="onSelectEdges"
        />
      </div>
    </v-card>
    <div style="display: flex; flex-direction: column; flex-basis: 40%;">
      <!-- The process parameter panel. -->
      <TheElementDetails
        v-if="!showInspector"
        :methods="processesValid"
        :models="modelServices"
        :selection="selection"
        style="flex: 1 1 auto"
        @edit:node="editNode($event)"
        @create:method="pushProcesses($event)"
        @edit:method="editProcess($event)"
        @create:model="pushModelServices($event)"
        @edit:model="editModelService($event)"
      />
      <TheVariableInspector
        v-else
        style="flex: 1 1 auto"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import type { WorkflowEdge, WorkflowNode } from '@/commons/types';
import TheElementDetails from '../TheElementDetails/TheElementDetails.vue';
import TheDevPanelBodyCanvas from './TheDevPanelBodyCanvas.vue';
import TheDevPanelBodyConsole from './TheDevPanelBodyConsole.vue';
import TheVariableInspector from './TheVariableInspector.vue';

export default {
  name: 'TheDevPanelBody',
  components: {
    TheElementDetails,
    TheDevPanelBodyCanvas,
    TheDevPanelBodyConsole,
    TheVariableInspector,
  },
  props: {
    showInspector: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
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
    onFlowFromNode(node: WorkflowNode) {
      this.setCurrentNode(node);
      this.executeWorkflow(node);
    },
    onSelectEdges(ids: string[]) {
      this.selectedEdgeIds = ids;
    },
  },
};
</script>

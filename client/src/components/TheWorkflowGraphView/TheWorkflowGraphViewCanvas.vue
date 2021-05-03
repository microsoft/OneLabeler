<template>
  <v-container
    class="pa-0"
    style="height: 600px"
  >
    <VFlowchart
      id="flowchart-canvas"
      ref="chart"
      :nodes="flowchartGraph.nodes"
      :edges="flowchartGraph.edges"
      style="height: 600px; width: 100%;"
      @edit:node="onEditNode"
      @create:edge="onCreateEdge"
      @select:nodes="onSelectNodes"
      @select:edges="onSelectEdges"
      @contextmenu="onContextMenuOfCanvas"
    >
      <template #node-shape="props">
        <g @contextmenu.stop="onContextMenuOfNode($event, props.node)">
          <template v-if="isNodeInitialization(props.node) || isNodeProcess(props.node)">
            <rect
              :width="props.node.width"
              :height="props.node.height"
              :stroke="props.isSelected ? 'black' : '#bbb'"
              fill-opacity="0"
              stroke-width="1"
            />
            <rect
              :width="props.node.width"
              :fill="isNodeProcess(props.node) ? '#8C564B' : '#FF7F0E'"
              height="5"
            />
          </template>
          <template v-else-if="isNodeDecision(props.node)">
            <polygon
              :points="`
                ${props.node.width / 2},0
                ${props.node.width},${props.node.height / 2}
                ${props.node.width / 2},${props.node.height}
                0,${props.node.height / 2}`"
              :stroke="props.isSelected ? 'black' : '#bbb'"
              fill-opacity="0"
              stroke-width="1"
            />
          </template>
          <template v-else-if="isNodeTerminal(props.node)">
            <circle
              :r="props.node.height / 2"
              :cx="props.node.width / 2"
              :cy="props.node.height / 2"
              :stroke="props.isSelected ? 'black' : '#bbb'"
              fill-opacity="0"
              stroke-width="1"
            />
          </template>
        </g>
      </template>
    </VFlowchart>

    <!-- The context menu for nodes. -->
    <v-menu
      v-model="showMenuOfNode"
      :position-x="rightClickClientX"
      :position-y="rightClickClientY"
      offset-y
    >
      <v-list
        class="py-0"
        style="font-size:12px"
      >
        <v-list-item
          class="py-0 pl-0 pr-1"
          style="min-height:24px"
          @click="onRemoveNode(rightClickedNode)"
        >
          <v-icon
            class="px-2"
            aria-hidden="true"
            style="font-size:12px"
            small
          >
            $vuetify.icons.values.close
          </v-icon>
          Remove Node
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- The context menu for canvas. -->
    <v-menu
      v-model="showMenuOfCanvas"
      :position-x="rightClickClientX"
      :position-y="rightClickClientY"
      absolute
      offset-y
    >
      <v-list
        class="py-0"
        style="font-size:12px"
      >
        <v-list-item
          v-for="(option, i) in createNodeMenu"
          :key="i"
          class="py-0 px-1"
          style="min-height:24px"
          @click="onCreateNode($event, option.value)"
        >
          {{ option.label }}
        </v-list-item>
      </v-list>
    </v-menu>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { v4 as uuidv4 } from 'uuid';
import {
  Process,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import VFlowchart from '../VFlowchart/VFlowchart.vue';
import { FlowchartEdge, FlowchartNode } from '../VFlowchart/types';

const createNodeMenu = [
  {
    label: 'create initialization node',
    value: WorkflowNodeType.Initialization,
  },
  {
    label: 'create feature extraction node',
    value: WorkflowNodeType.FeatureExtraction,
  },
  {
    label: 'create data object selection node',
    value: WorkflowNodeType.DataObjectSelection,
  },
  {
    label: 'create default labeling node',
    value: WorkflowNodeType.DefaultLabeling,
  },
  {
    label: 'create task transformation node',
    value: WorkflowNodeType.TaskTransformation,
  },
  {
    label: 'create interactive labeling node',
    value: WorkflowNodeType.InteractiveLabeling,
  },
  {
    label: 'create stoppage analysis node',
    value: WorkflowNodeType.StoppageAnalysis,
  },
  {
    label: 'create interim model training node',
    value: WorkflowNodeType.InterimModelTraining,
  },
  {
    label: 'create decision node',
    value: WorkflowNodeType.Decision,
  },
  {
    label: 'create terminal node',
    value: WorkflowNodeType.Terminal,
  },
];

const nodeMapper = (node: WorkflowNode): FlowchartNode => ({
  id: node.id,
  label: node.label,
  type: node.type,
  x: node.layout.x,
  y: node.layout.y,
  width: 60,
  height: 60,
});

const edgeMapper = (edge: WorkflowEdge): FlowchartEdge => ({
  id: edge.id,
  source: {
    nodeId: edge.source,
    direction: 'Right',
    dx: 60,
    dy: 30,
  },
  target: {
    nodeId: edge.target,
    direction: 'Left',
    dx: 0,
    dy: 30,
  },
});

export default Vue.extend({
  name: 'TheWorkflowGraphViewCanvas',
  components: {
    VFlowchart,
  },
  props: {
    graph: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      showMenuOfNode: false,
      showMenuOfCanvas: false,
      rightClickClientX: null as null | number,
      rightClickClientY: null as null | number,
      rightClickCanvasX: null as null | number,
      rightClickCanvasY: null as null | number,
      rightClickedNode: null as null | WorkflowNode,
      createNodeMenu,
      selectedNodes: [] as FlowchartNode[],
      selectedEdges: [] as FlowchartEdge[],
    };
  },
  computed: {
    flowchartGraph() {
      const { graph } = this;
      return {
        nodes: graph.nodes.map((d: WorkflowNode) => nodeMapper(d)),
        edges: graph.edges.map((d: WorkflowEdge) => edgeMapper(d)),
      };
    },
  },
  created(): void {
    window.addEventListener('keydown', this.onKey);
  },
  beforeDestroy(): void {
    window.removeEventListener('keydown', this.onKey);
  },
  methods: {
    isNodeInitialization(node: WorkflowNode): boolean {
      return node.type === WorkflowNodeType.Initialization;
    },
    isNodeProcess(node: WorkflowNode): boolean {
      return (node.type === WorkflowNodeType.LabelIdeation)
        || (node.type === WorkflowNodeType.FeatureExtraction)
        || (node.type === WorkflowNodeType.DataObjectSelection)
        || (node.type === WorkflowNodeType.DefaultLabeling)
        || (node.type === WorkflowNodeType.TaskTransformation)
        || (node.type === WorkflowNodeType.InteractiveLabeling)
        || (node.type === WorkflowNodeType.StoppageAnalysis)
        || (node.type === WorkflowNodeType.InterimModelTraining)
        || (node.type === WorkflowNodeType.QualityAssurance);
    },
    isNodeDecision(node: WorkflowNode): boolean {
      return node.type === WorkflowNodeType.Decision;
    },
    isNodeTerminal(node: WorkflowNode): boolean {
      return node.type === WorkflowNodeType.Terminal;
    },
    isNodeDummifiable(node: WorkflowNode): boolean {
      return (node.type === WorkflowNodeType.DataObjectSelection)
        || (node.type === WorkflowNodeType.DefaultLabeling)
        || (node.type === WorkflowNodeType.InteractiveLabeling)
        || (node.type === WorkflowNodeType.InterimModelTraining);
    },
    isNodeImplemented(node: WorkflowNode): boolean {
      if (!this.isNodeProcess(node)) return true;
      if (node.value === undefined || node.value === null) return false;
      if (Array.isArray(node.value) && node.value.length === 0) return false;
      return true;
    },
    isNodeDummyImplemented(node: WorkflowNode): boolean {
      if (!this.isNodeProcess(node)) return false;
      if (node.value === undefined || node.value === null) return false;

      if (node.type === WorkflowNodeType.FeatureExtraction) {
        return (node.value as Process).api === 'Random3D';
      }
      if (node.type === WorkflowNodeType.DataObjectSelection) {
        if (!Array.isArray(node.value)) return false;
        if (node.value.length === 0) return false;
        return node.value.length === 1 && node.value[0].api === 'Random';
      }
      if (node.type === WorkflowNodeType.DefaultLabeling) {
        return (node.value as Process).api === 'Null';
      }
      if (node.type === WorkflowNodeType.InteractiveLabeling) {
        return node.value === undefined
          || (node.value as Process[]).length === 0;
      }
      if (node.type === WorkflowNodeType.InterimModelTraining) {
        return (node.value as Process).api === 'Static';
      }
      return false;
    },
    workflowToFlowchartNode(node: WorkflowNode): FlowchartNode {
      return {
        id: node.id,
        label: node.label,
        type: node.type,
        x: node.layout.x,
        y: node.layout.y,
        width: 60,
        height: 60,
      };
    },
    flowchartToWorkflowNode(node: FlowchartNode): WorkflowNode {
      const { id } = node;
      const workflowNode = this.graph.nodes.find((d) => d.id === id);
      return {
        ...workflowNode,
        label: node.label,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
      };
    },
    workflowToFlowchartEdge(edge: WorkflowEdge): FlowchartEdge {
      return {
        id: edge.id,
        source: {
          nodeId: edge.source,
          direction: 'Right',
          dx: 60,
          dy: 30,
        },
        target: {
          nodeId: edge.target,
          direction: 'Left',
          dx: 0,
          dy: 30,
        },
      };
    },
    flowchartToWorkflowEdge(edge: FlowchartEdge): WorkflowEdge {
      const { id } = edge;
      const workflowEdge = this.graph.edges.find((d) => d.id === id);
      return {
        ...workflowEdge,
        source: edge.source.nodeId,
        target: edge.target.nodeId,
      };
    },
    onContextMenuOfNode(e: MouseEvent, node: WorkflowNode): void {
      this.showMenuOfCanvas = false;
      e.preventDefault();
      this.showMenuOfNode = true;
      this.rightClickClientX = e.clientX;
      this.rightClickClientY = e.clientY;
      this.rightClickedNode = node;
    },
    onContextMenuOfCanvas(e: MouseEvent): void {
      this.showMenuOfNode = false;
      e.preventDefault();
      this.showMenuOfCanvas = true;
      this.rightClickClientX = e.clientX;
      this.rightClickClientY = e.clientY;
      this.rightClickCanvasX = e.offsetX;
      this.rightClickCanvasY = e.offsetY;
    },
    onClickNode(node: WorkflowNode): void {
      this.$emit('click:node', node);
    },
    onCreateNode(e: MouseEvent, type: WorkflowNodeType) {
      const labelMapper = {
        [WorkflowNodeType.Initialization]: 'initialization',
        [WorkflowNodeType.FeatureExtraction]: 'feature extraction',
        [WorkflowNodeType.DataObjectSelection]: 'data object selection',
        [WorkflowNodeType.DefaultLabeling]: 'default labeling',
        [WorkflowNodeType.TaskTransformation]: 'task transformation',
        [WorkflowNodeType.InteractiveLabeling]: 'interactive labeling',
        [WorkflowNodeType.StoppageAnalysis]: 'stoppage analysis',
        [WorkflowNodeType.InterimModelTraining]: 'interim model training',
        [WorkflowNodeType.Decision]: 'decision',
        [WorkflowNodeType.Terminal]: 'terminal',
      } as Record<WorkflowNodeType, string>;
      const valueMapper = {
        [WorkflowNodeType.Initialization]: { dataType: null, labelTasks: [] },
        [WorkflowNodeType.FeatureExtraction]: undefined,
        [WorkflowNodeType.DataObjectSelection]: [],
        [WorkflowNodeType.DefaultLabeling]: undefined,
        [WorkflowNodeType.TaskTransformation]: undefined,
        [WorkflowNodeType.InteractiveLabeling]: [],
        [WorkflowNodeType.StoppageAnalysis]: undefined,
        [WorkflowNodeType.InterimModelTraining]: undefined,
        [WorkflowNodeType.Decision]: undefined,
        [WorkflowNodeType.Terminal]: undefined,
      } as Record<WorkflowNodeType, unknown>;
      const node = {
        id: uuidv4(),
        type,
        x: this.rightClickCanvasX,
        y: this.rightClickCanvasY,
        label: labelMapper[type],
        value: valueMapper[type],
      } as WorkflowNode;
      this.$emit('create:node', node);
    },
    onSelectNodes(nodes: FlowchartNode[]) {
      this.selectedNodes = nodes;
    },
    onEditNode(node: FlowchartNode) {
      const newValue = this.flowchartToWorkflowNode(node);
      this.$emit('edit:node', newValue);
    },
    onRemoveNode(node: { id: string }): void {
      this.$emit('remove:node', node);
    },
    onCreateEdge(edge: FlowchartEdge) {
      if (edge.source.nodeId === edge.target.nodeId) return;
      const newValue = this.flowchartToWorkflowEdge(edge);
      this.$emit('create:edge', newValue);
    },
    onSelectEdges(edges: FlowchartEdge[]) {
      this.selectedEdges = edges;
    },
    onRemoveEdge(edge: { id: string }) {
      this.$emit('remove:edge', edge);
    },
    onDeleteSelected() {
      const toBeRemovedNodes = this.selectedNodes;
      const toBeRemovedEdges = this.flowchartGraph.edges.filter((edge) => (
        this.selectedEdges.find((d) => d.id === edge.id) !== undefined
        || toBeRemovedNodes.find((d) => d.id === edge.source.nodeId) !== undefined
        || toBeRemovedNodes.find((d) => d.id === edge.target.nodeId) !== undefined
      ));
      toBeRemovedEdges.forEach((edge) => {
        this.onRemoveEdge(edge);
      });
      toBeRemovedNodes.forEach((node) => {
        this.onRemoveNode(node);
      });
    },
    onKey(e: KeyboardEvent): void {
      const { key, ctrlKey } = e;
      const movementMapper = {
        ArrowLeft: { dx: -10, dy: 0 },
        ArrowUp: { dx: 0, dy: -10 },
        ArrowRight: { dx: 10, dy: 0 },
        ArrowDown: { dx: 0, dy: 10 },
      } as Record<string, { dx: number, dy: number }>;
      if (key in movementMapper) {
        const { dx, dy } = movementMapper[key];
        this.selectedNodes.forEach((node) => {
          const nodeUpdated = {
            ...node,
            x: node.x + dx,
            y: node.y + dy,
          };
          this.onEditNode(nodeUpdated);
        });
      }
      if (key === 'a' && ctrlKey) {
        e.preventDefault();
        const component = this.$refs.chart as Vue & {
          selectedNodeIds: string[],
          selectedEdgeIds: string[],
        };
        component.selectedNodeIds = this.flowchartGraph.nodes.map((d) => d.id);
        component.selectedEdgeIds = this.flowchartGraph.edges.map((d) => d.id);
      }
      if (key === 'Delete') {
        this.onDeleteSelected();
      }
    },
  },
});
</script>
<style>
#flowchart-canvas {
  background-size: 20px 20px, 20px 20px, 10px 10px, 10px 10px;
  background-image: linear-gradient(to right, #dfdfdf 1px, transparent 1px),
  linear-gradient(to bottom, #dfdfdf 1px, transparent 1px),
  linear-gradient(to right, #f1f1f1 1px, transparent 1px),
  linear-gradient(to bottom, #f1f1f1 1px, transparent 1px);
  background-position: left -0.5px top -0.5px;
  background-repeat: initial;
}
</style>

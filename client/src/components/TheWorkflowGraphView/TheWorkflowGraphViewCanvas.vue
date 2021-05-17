<template>
  <div
    class="pa-0"
    style="height: 600px; width: 100%;"
  >
    <!-- set tabindex=-1 to make the element focusable -->
    <VFlowchart
      id="flowchart-canvas"
      ref="chart"
      :nodes="flowchartGraph.nodes"
      :edges="flowchartGraph.edges"
      tabindex="-1"
      style="height: 600px; width: 100%;"
      @edit:node="onEditNode"
      @create:edge="onCreateEdge"
      @select:nodes="onSelectNodes"
      @select:edges="onSelectEdges"
      @contextmenu="onContextMenuOfCanvas"
      @contextmenu:edge="onContextMenuOfEdge"
    >
      <template #node-shape="props">
        <g @contextmenu.stop="onContextMenuOfNode(props.node, $event)">
          <template v-if="isNodeInitialization(props.node) || isNodeProcess(props.node)">
            <template v-if="isNodeInteractive(props.node)">
              <!-- icon denoting the node is interactive -->
              <g :transform="`translate(${0},${-20})`">
                <rect
                  width="20"
                  height="20"
                  fill="white"
                  stroke="#bbb"
                  stroke-width="1"
                />
                <text
                  x="10"
                  y="15"
                  style="
                    text-anchor: middle;
                    user-select: none;
                    font-family: Font Awesome\ 5 Free;
                    font-weight: 900;
                  "
                >
                  &#xf007;
                </text>
              </g>
            </template>
            <template v-if="!isNodeServerless(props.node)">
              <!-- icon denoting the node is not serverless -->
              <g :transform="`translate(
                ${isNodeInteractive(props.node) ? 20 : 0},${-20})
              `">
                <rect
                  width="20"
                  height="20"
                  fill="white"
                  stroke="#bbb"
                  stroke-width="1"
                />
                <text
                  x="10"
                  y="15"
                  style="
                    text-anchor: middle;
                    user-select: none;
                    font-family: Font Awesome\ 5 Free;
                    font-weight: 900;
                  "
                >
                  &#xf233;
                </text>
              </g>
            </template>
            <rect
              :width="props.node.width"
              :height="props.node.height"
              :stroke="props.isSelected
                ? 'black'
                : (isNodeCurrent(props.node) ? 'red' : '#bbb')"
              fill="white"
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
              :stroke="props.isSelected
                ? 'black'
                : (isNodeCurrent(props.node) ? 'red' : '#bbb')"
              fill="white"
              stroke-width="1"
            />
          </template>
          <template v-else-if="isNodeTerminal(props.node)">
            <circle
              :r="props.node.height / 2"
              :cx="props.node.width / 2"
              :cy="props.node.height / 2"
              :stroke="props.isSelected
                ? 'black'
                : (isNodeCurrent(props.node) ? 'red' : '#bbb')"
              fill="white"
              stroke-width="1"
            />
          </template>
        </g>
      </template>
    </VFlowchart>

    <!-- The context menu for canvas. -->
    <v-menu
      v-model="showMenuOfCanvas"
      :position-x="rightClickClientX"
      :position-y="rightClickClientY"
      content-class="elevation-2"
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

    <!-- The context menu for edges. -->
    <v-menu
      v-model="showMenuOfEdge"
      :position-x="rightClickClientX"
      :position-y="rightClickClientY"
      content-class="elevation-2"
      offset-y
    >
      <v-list
        class="py-0"
        style="font-size:12px"
      >
        <v-list-item
          class="py-0 pl-0 pr-1"
          style="min-height:24px"
          @click="onRemoveSelected"
        >
          <v-icon
            class="px-2"
            aria-hidden="true"
            style="font-size:12px; width: 1.5rem;"
            small
          >
            $vuetify.icons.values.reset
          </v-icon>
          Remove
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- The context menu for nodes. -->
    <v-menu
      v-model="showMenuOfNode"
      :position-x="rightClickClientX"
      :position-y="rightClickClientY"
      content-class="elevation-2"
      offset-y
    >
      <v-list
        class="py-0"
        style="font-size:12px"
      >
        <v-list-item
          v-if="selectedEdges.length === 0 && selectedNodes.length === 1"
          class="py-0 pl-0 pr-1"
          style="min-height:24px"
          @click="onFlowFromSelectedNode"
        >
          <v-icon
            class="px-2"
            aria-hidden="true"
            style="font-size:12px; width: 1.5rem;"
            small
          >
            $vuetify.icons.values.flowChart
          </v-icon>
          Jump To & Flow
        </v-list-item>
        <v-list-item
          v-if="selectedEdges.length === 0 && selectedNodes.length === 1"
          class="py-0 pl-0 pr-1"
          style="min-height:24px"
          @click="onJumpToSelectedNode"
        >
          <v-icon
            class="px-2"
            aria-hidden="true"
            style="font-size:12px; width: 1.5rem;"
            small
          >
            $vuetify.icons.values.skip
          </v-icon>
          Jump To
        </v-list-item>
        <v-list-item
          class="py-0 pl-0 pr-1"
          style="min-height:24px"
          @click="onRemoveSelected"
        >
          <v-icon
            class="px-2"
            aria-hidden="true"
            style="font-size:12px; width: 1.5rem;"
            small
          >
            $vuetify.icons.values.reset
          </v-icon>
          Remove
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import {
  Process,
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import {
  isNodeProcess,
  isNodeInteractive,
  isNodeServerless,
} from '@/commons/utils';
import VFlowchart from '../VFlowchart/VFlowchart.vue';
import { FlowchartEdge, FlowchartNode } from '../VFlowchart/types';

// TODO: may reduce the frequency of syncing the flowchart graph
// and workflow graph to improve the performance.
// E.g., only save the flowchart graph to workflow when clicking
// the save button.
// Or only save the flowchart graph when drag end instead of drag move.
// Alternatively, separate the storage of graph itself and the layout.
// So that layout update will not affect the component listening to
// the graph's update.

type FlowchartGraph = {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

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

const nodeAdaptor = (node: WorkflowNode): FlowchartNode => ({
  id: node.id,
  label: node.label,
  type: node.type,
  x: node.layout.x,
  y: node.layout.y,
  width: node.layout.width,
  height: node.layout.height,
});

const edgeAdaptor = (edge: WorkflowEdge): FlowchartEdge => ({
  id: edge.id,
  source: {
    nodeId: edge.source,
    direction: edge.layout.source.direction,
    dx: edge.layout.source.dx,
    dy: edge.layout.source.dy,
  },
  target: {
    nodeId: edge.target,
    direction: edge.layout.target.direction,
    dx: edge.layout.target.dx,
    dy: edge.layout.target.dy,
  },
});

export default Vue.extend({
  name: 'TheWorkflowGraphViewCanvas',
  components: {
    VFlowchart,
  },
  props: {
    graph: {
      type: Object as PropType<WorkflowGraph>,
      default: null,
    },
    currentNode: {
      type: Object as PropType<WorkflowNode>,
      default: null,
    },
  },
  data() {
    return {
      showMenuOfCanvas: false,
      showMenuOfEdge: false,
      showMenuOfNode: false,
      rightClickClientX: null as null | number,
      rightClickClientY: null as null | number,
      rightClickCanvasX: null as null | number,
      rightClickCanvasY: null as null | number,
      createNodeMenu,
      selectedNodeIds: [] as string[],
      selectedEdgeIds: [] as string[],
    };
  },
  computed: {
    flowchartGraph(): FlowchartGraph {
      const { graph } = this;
      return {
        nodes: graph.nodes.map((d: WorkflowNode) => nodeAdaptor(d)),
        edges: graph.edges.map((d: WorkflowEdge) => edgeAdaptor(d)),
      };
    },
    selectedNodes(): WorkflowNode[] {
      const { nodes } = this.graph;
      return this.selectedNodeIds.map((d) => (
        nodes.find((node) => node.id === d) as WorkflowNode
      ));
    },
    selectedEdges(): WorkflowEdge[] {
      const { edges } = this.graph;
      return this.selectedEdgeIds.map((d) => (
        edges.find((edge) => edge.id === d) as WorkflowEdge
      ));
    },
  },
  created(): void {
    window.addEventListener('keydown', this.onKey);
  },
  beforeDestroy(): void {
    window.removeEventListener('keydown', this.onKey);
  },
  methods: {
    isNodeProcess,
    isNodeInitialization(node: WorkflowNode): boolean {
      return node.type === WorkflowNodeType.Initialization;
    },
    isNodeDecision(node: WorkflowNode): boolean {
      return node.type === WorkflowNodeType.Decision;
    },
    isNodeTerminal(node: WorkflowNode): boolean {
      return node.type === WorkflowNodeType.Terminal;
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
    isNodeInteractive(node: FlowchartNode): boolean {
      const match = this.graph.nodes.find((d) => d.id === node.id);
      if (match === undefined) return false;
      return isNodeInteractive(match);
    },
    isNodeServerless(node: FlowchartNode): boolean {
      const match = this.graph.nodes.find((d) => d.id === node.id);
      if (match === undefined) return true;
      return isNodeServerless(match);
    },
    isNodeCurrent(node: WorkflowNode): boolean {
      if (this.currentNode === null) return false;
      return node.id === this.currentNode.id;
    },
    isCanvasActive(): boolean {
      const { activeElement } = document;
      if (activeElement === null) return false;
      const canvas = ((this.$refs.chart as Vue).$el as HTMLElement);
      return activeElement === canvas;
    },
    focusToCanvas() {
      const canvas = ((this.$refs.chart as Vue).$el as HTMLElement);
      canvas.focus();
    },
    onContextMenuOfNode(node: FlowchartNode, e: MouseEvent): void {
      e.preventDefault();
      this.showMenuOfCanvas = false;
      this.showMenuOfEdge = false;
      this.showMenuOfNode = true;
      this.rightClickClientX = e.clientX;
      this.rightClickClientY = e.clientY;
    },
    onContextMenuOfEdge(edge: FlowchartNode, e: MouseEvent): void {
      e.preventDefault();
      this.showMenuOfCanvas = false;
      this.showMenuOfEdge = true;
      this.showMenuOfNode = false;
      this.rightClickClientX = e.clientX;
      this.rightClickClientY = e.clientY;
    },
    onContextMenuOfCanvas(e: MouseEvent): void {
      e.preventDefault();
      this.showMenuOfCanvas = true;
      this.showMenuOfEdge = false;
      this.showMenuOfNode = false;
      this.rightClickClientX = e.clientX;
      this.rightClickClientY = e.clientY;
      this.rightClickCanvasX = e.offsetX;
      this.rightClickCanvasY = e.offsetY;
    },
    onCreateNode(e: MouseEvent, type: WorkflowNodeType) {
      const labelMapper = {
        [WorkflowNodeType.Initialization]: 'initialization',
        [WorkflowNodeType.FeatureExtraction]: 'feature extraction',
        [WorkflowNodeType.DataObjectSelection]: 'data object selection',
        [WorkflowNodeType.DefaultLabeling]: 'default labeling',
        [WorkflowNodeType.TaskTransformation]: 'task transform',
        [WorkflowNodeType.InteractiveLabeling]: 'interactive labeling',
        [WorkflowNodeType.StoppageAnalysis]: 'stoppage analysis',
        [WorkflowNodeType.InterimModelTraining]: 'interim model training',
        [WorkflowNodeType.Decision]: 'decision',
        [WorkflowNodeType.Terminal]: 'terminal',
      } as Record<WorkflowNodeType, string>;
      const valueMapper = {
        [WorkflowNodeType.Initialization]: { dataType: null, labelTasks: [] },
        [WorkflowNodeType.FeatureExtraction]: null,
        [WorkflowNodeType.DataObjectSelection]: [],
        [WorkflowNodeType.DefaultLabeling]: null,
        [WorkflowNodeType.TaskTransformation]: null,
        [WorkflowNodeType.InteractiveLabeling]: [],
        [WorkflowNodeType.StoppageAnalysis]: null,
        [WorkflowNodeType.InterimModelTraining]: null,
        [WorkflowNodeType.Decision]: undefined,
        [WorkflowNodeType.Terminal]: undefined,
      } as Record<WorkflowNodeType, unknown>;
      const node = {
        id: uuidv4(),
        type,
        label: labelMapper[type],
        value: valueMapper[type],
        layout: {
          x: this.rightClickCanvasX,
          y: this.rightClickCanvasY,
          width: type === WorkflowNodeType.Terminal ? 60 : 80,
          height: 60,
        },
      } as WorkflowNode;
      this.$emit('create:node', node);
      this.focusToCanvas();
    },
    onEditNode(node: FlowchartNode) {
      const { id } = node;
      const workflowNode = this.graph.nodes.find((d) => d.id === id) as WorkflowNode;
      const newValue: WorkflowNode = {
        ...workflowNode,
        label: node.label,
        layout: {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
        },
      };
      this.$emit('edit:node', newValue);
    },
    onRemoveNode(node: { id: string }): void {
      this.$emit('remove:node', node);
    },
    onSelectNodes(nodes: FlowchartNode[]) {
      // Note: store the node ids instead of directly storing the nodes
      // in case the node properties stored in the child component is not up to date.
      this.selectedNodeIds = nodes.map((d) => d.id);
      this.$emit('select:nodes', this.selectedNodeIds);
    },
    onCreateEdge(edge: FlowchartEdge) {
      if (edge.source.nodeId === edge.target.nodeId) return;
      const newValue = {
        id: edge.id,
        source: edge.source.nodeId,
        target: edge.target.nodeId,
        layout: {
          source: {
            direction: edge.source.direction,
            dx: edge.source.dx,
            dy: edge.source.dy,
          },
          target: {
            direction: edge.target.direction,
            dx: edge.target.dx,
            dy: edge.target.dy,
          },
        },
      };
      this.$emit('create:edge', newValue);
    },
    onRemoveEdge(edge: { id: string }) {
      this.$emit('remove:edge', edge);
    },
    onSelectEdges(edges: FlowchartEdge[]) {
      // Note: store the node ids instead of directly storing the nodes
      // in case the node properties stored in the child component is not up to date.
      this.selectedEdgeIds = edges.map((d) => d.id);
      this.$emit('select:edges', this.selectedEdgeIds);
    },
    onRemoveSelected() {
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
      this.focusToCanvas();
    },
    onJumpToSelectedNode() {
      if (this.selectedNodes.length !== 1) return;
      const [node] = this.selectedNodes;
      this.$emit('jumpto:node', node);
      this.focusToCanvas();
    },
    onFlowFromSelectedNode() {
      if (this.selectedNodes.length !== 1) return;
      const [node] = this.selectedNodes;
      this.$emit('flowfrom:node', node);
      this.focusToCanvas();
    },
    onKey(e: KeyboardEvent): void {
      if (!this.isCanvasActive()) return;

      const { key, ctrlKey } = e;
      const movementMapper = {
        ArrowLeft: { dx: -10, dy: 0 },
        ArrowUp: { dx: 0, dy: -10 },
        ArrowRight: { dx: 10, dy: 0 },
        ArrowDown: { dx: 0, dy: 10 },
      } as Record<string, { dx: number, dy: number }>;
      if (key in movementMapper) {
        const { dx, dy } = movementMapper[key];
        this.selectedNodes.map((d) => nodeAdaptor(d)).forEach((node) => {
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
        this.onRemoveSelected();
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

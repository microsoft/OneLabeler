<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div>
    <!-- set tabindex=-1 to make the element focusable -->
    <VFlowchart
      id="flowchart-canvas"
      ref="chart"
      :nodes="flowchartGraph.nodes"
      :edges="flowchartGraph.edges"
      :selected-node-ids="selectedNodeIds"
      :selected-edge-ids="selectedEdgeIds"
      tabindex="-1"
      style="width: 100%; height: 100%;"
      @edit:node="onEditNode"
      @create:edge="onCreateEdge"
      @contextmenu.native.prevent="onContextMenuOfCanvas"
      @update:selectedNodeIds="$emit('update:selectedNodeIds', $event)"
      @update:selectedEdgeIds="$emit('update:selectedEdgeIds', $event)"
    >
      <template #node="props">
        <VNode
          :node="extendNode(props.node)"
          :is-executing="isNodeExecuting(props.node)"
          :color="props.isSelected
            ? 'black'
            : (idToConsoleMessages[props.node.id].length > 0 ? '#f5504e' : '#bbb')
          "
          :opacity="getNodeOpacity(props.node)"
          @contextmenu.native.stop.prevent="onContextMenuOfNode"
        />
      </template>
      <template #edge="props">
        <VEdge
          :path="props.path"
          :path-data="props.pathData"
          :label="props.edge.condition === undefined ? '' : `${props.edge.condition}`"
          :color="props.isSelected
            ? 'black'
            : (idToConsoleMessages[props.edge.id].length > 0 ? '#f5504e' : '#bbb')
          "
          :opacity="getEdgeOpacity(props.edge)"
          @contextmenu.native.stop.prevent="onContextMenuOfEdge"
        />
      </template>
    </VFlowchart>

    <!-- The context menu for canvas. -->
    <TheMenuOfCanvas
      v-if="showMenuOfCanvas"
      :show="showMenuOfCanvas"
      :position-x="rightClickClientX"
      :position-y="rightClickClientY"
      @click:option="onCreateNode($event)"
      @update:show="showMenuOfCanvas = $event"
    />

    <!-- The context menu for edges. -->
    <TheMenuOfEdge
      v-if="showMenuOfEdge"
      :show="showMenuOfEdge"
      :position-x="rightClickClientX"
      :position-y="rightClickClientY"
      @remove:selected="onRemoveSelected"
      @update:show="showMenuOfEdge = $event"
      @switch-direction="onSwitchEdgeDirection"
    />

    <!-- The context menu for nodes. -->
    <TheMenuOfNode
      v-if="showMenuOfNode"
      :show="showMenuOfNode"
      :position-x="rightClickClientX"
      :position-y="rightClickClientY"
      @execute-from:node="onExecuteFromSelectedNode"
      @execute-1-step-from:node="onExecuteOneStepFromSelectedNode"
      @goto:node="onGotoSelectedNode"
      @remove:selected="onRemoveSelected"
      @update:show="showMenuOfNode = $event"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { ComponentInstance, PropType } from '@vue/composition-api';
import { mapGetters } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import { WorkflowNodeType } from '@/commons/types';
import type {
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
} from '@/commons/types';
import type { LintMessage } from '@/commons/workflow-utils';
import { getDefaultNodeSize } from '@/commons/workflow-utils/parse-node';
import BaseInitialization from '@/builtins/modules/initialization/base';
import BaseDecision from '@/builtins/modules/decision/base';
import BaseExit from '@/builtins/modules/exit/base';
import BaseModule from '@/builtins/modules/base-module';
import VFlowchart from '../VFlowchart/VFlowchart.vue';
import { PortDirection } from '../VFlowchart/types';
import type { FlowchartEdge, FlowchartNode } from '../VFlowchart/types';
import VNode from './VNode.vue';
import VEdge from './VEdge.vue';
import TheMenuOfCanvas from './TheMenuOfCanvas.vue';
import TheMenuOfEdge from './TheMenuOfEdge.vue';
import TheMenuOfNode from './TheMenuOfNode.vue';

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
  condition: edge.condition,
});

export default defineComponent({
  name: 'TheWorkflowViewBody',
  components: {
    VFlowchart,
    VNode,
    VEdge,
    TheMenuOfCanvas,
    TheMenuOfEdge,
    TheMenuOfNode,
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
    'create:node': null,
    'edit:node': null,
    'remove:node': null,
    'create:edge': null,
    'edit:edge': null,
    'remove:edge': null,
    'goto:node': null,
    'execute-from:node': null,
    'execute-1-step-from:node': null,
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
    };
  },
  computed: {
    ...mapGetters('workflow', ['consoleMessages']),
    idToConsoleMessages(): Record<string, LintMessage[]> {
      const consoleMessages = this.consoleMessages as LintMessage[];
      const graph = this.graph as WorkflowGraph;

      const map: Record<string, LintMessage[]> = {};
      graph.nodes.forEach((node) => { map[node.id] = []; });
      graph.edges.forEach((edge) => { map[edge.id] = []; });
      consoleMessages.forEach((message) => {
        const { subjects } = message;
        if (subjects === undefined) return;
        subjects.forEach((subject) => {
          map[subject.id] = [
            ...(subject.id in map ? map[subject.id] : []),
            message,
          ];
        });
      });
      return map;
    },
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
    extendNode(node: FlowchartNode): (WorkflowNode & FlowchartNode) | null {
      const match = this.graph.nodes.find((d) => d.id === node.id);
      if (match === undefined) return null;
      return { ...node, ...match };
    },
    isNodeExecuting(node: WorkflowNode): boolean {
      if (this.currentNode === null) return false;
      return node.id === this.currentNode.id;
    },
    isCanvasActive(): boolean {
      const { activeElement } = document;
      if (activeElement === null) return false;
      const canvas = ((this.$refs.chart as ComponentInstance).$el as HTMLElement);
      return activeElement === canvas;
    },
    focusToCanvas(): void {
      const canvas = ((this.$refs.chart as ComponentInstance).$el as HTMLElement);
      canvas.focus();
    },
    getNodeOpacity(node: FlowchartNode): number {
      const { hoveredNodeIds, hoveredEdgeIds } = this;
      if (hoveredNodeIds.length === 0 && hoveredEdgeIds.length === 0) return 1;
      return hoveredNodeIds.includes(node.id) ? 1 : 0.3;
    },
    getEdgeOpacity(edge: FlowchartEdge): number {
      const { hoveredNodeIds, hoveredEdgeIds } = this;
      if (hoveredNodeIds.length === 0 && hoveredEdgeIds.length === 0) return 1;
      return hoveredEdgeIds.includes(edge.id) ? 1 : 0.3;
    },
    onContextMenuOfNode(e: MouseEvent): void {
      this.showMenuOfCanvas = false;
      this.showMenuOfEdge = false;
      this.showMenuOfNode = true;
      this.rightClickClientX = e.clientX;
      this.rightClickClientY = e.clientY;
    },
    onContextMenuOfEdge(e: MouseEvent): void {
      this.showMenuOfCanvas = false;
      this.showMenuOfEdge = true;
      this.showMenuOfNode = false;
      this.rightClickClientX = e.clientX;
      this.rightClickClientY = e.clientY;
    },
    onContextMenuOfCanvas(e: MouseEvent): void {
      this.showMenuOfCanvas = true;
      this.showMenuOfEdge = false;
      this.showMenuOfNode = false;
      this.rightClickClientX = e.clientX;
      this.rightClickClientY = e.clientY;
      this.rightClickCanvasX = e.offsetX;
      this.rightClickCanvasY = e.offsetY;
    },
    onCreateNode(type: WorkflowNodeType): void {
      if (this.rightClickCanvasX === null || this.rightClickCanvasY === null) {
        throw new Error('New node position not specified');
      }

      const labelMapper = {
        [WorkflowNodeType.Initialization]: 'initialization',
        [WorkflowNodeType.FeatureExtraction]: 'feature extraction',
        [WorkflowNodeType.DataObjectSelection]: 'data object selection',
        [WorkflowNodeType.DefaultLabeling]: 'default labeling',
        [WorkflowNodeType.InteractiveLabeling]: 'interactive labeling',
        [WorkflowNodeType.StoppageAnalysis]: 'stoppage analysis',
        [WorkflowNodeType.ModelTraining]: 'model training',
        [WorkflowNodeType.QualityAssurance]: 'quality assurance',
        [WorkflowNodeType.LabelIdeation]: 'label ideation',
        [WorkflowNodeType.Base]: 'custom',
        [WorkflowNodeType.Decision]: 'conditional branching',
        [WorkflowNodeType.Exit]: 'exit',
      } as Record<WorkflowNodeType, string>;
      const valueMapper = {
        [WorkflowNodeType.Initialization]: new BaseInitialization(),
        [WorkflowNodeType.Decision]: new BaseDecision(),
        [WorkflowNodeType.Exit]: new BaseExit(),
        [WorkflowNodeType.FeatureExtraction]: null,
        [WorkflowNodeType.DataObjectSelection]: null,
        [WorkflowNodeType.DefaultLabeling]: null,
        [WorkflowNodeType.InteractiveLabeling]: null,
        [WorkflowNodeType.StoppageAnalysis]: null,
        [WorkflowNodeType.ModelTraining]: null,
        [WorkflowNodeType.QualityAssurance]: null,
        [WorkflowNodeType.LabelIdeation]: null,
        [WorkflowNodeType.Base]: null,
      } as Record<WorkflowNodeType, BaseModule | null>;
      const node: WorkflowNode = {
        id: uuidv4(),
        type,
        label: labelMapper[type],
        value: valueMapper[type],
        layout: {
          x: this.rightClickCanvasX,
          y: this.rightClickCanvasY,
          ...getDefaultNodeSize(type),
        },
      };
      this.$emit('create:node', node);
      this.focusToCanvas();
    },
    onEditNode(node: FlowchartNode): void {
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
    onCreateEdge(edge: FlowchartEdge): void {
      // Do not allow self loop.
      if (edge.source.nodeId === edge.target.nodeId) return;

      // For edge with decision node as source, create condition attribute
      const source = this.graph.nodes.find((d) => d.id === edge.source.nodeId);
      if (source === undefined) return;
      let condition = {};
      if (source.type === WorkflowNodeType.Decision) {
        const pairedEdge = this.graph.edges.find((d) => d.source === edge.source.nodeId);
        if (pairedEdge !== undefined) {
          condition = { condition: !pairedEdge.condition };
        } else {
          condition = { condition: edge.source.direction === PortDirection.Bottom };
        }
      }

      const newValue: WorkflowEdge = {
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
        ...condition,
      };
      this.$emit('create:edge', newValue);
    },
    onSwitchEdgeDirection(): void {
      this.selectedEdges.forEach((edge) => {
        const newValue = {
          ...edge,
          layout: {
            source: edge.layout.target,
            target: edge.layout.source,
          },
          source: edge.target,
          target: edge.source,
        };
        this.$emit('edit:edge', newValue);
      });
    },
    onRemoveSelected(): void {
      const toBeRemovedNodes = this.selectedNodes;
      const toBeRemovedEdges = this.flowchartGraph.edges.filter((edge) => (
        this.selectedEdges.find((d) => d.id === edge.id) !== undefined
        || toBeRemovedNodes.find((d) => d.id === edge.source.nodeId) !== undefined
        || toBeRemovedNodes.find((d) => d.id === edge.target.nodeId) !== undefined
      ));
      toBeRemovedEdges.forEach((edge) => {
        this.$emit('remove:edge', edge);
      });
      toBeRemovedNodes.forEach((node) => {
        this.$emit('remove:node', node);
      });
      this.focusToCanvas();
    },
    onGotoSelectedNode(): void {
      if (this.selectedNodes.length !== 1) return;
      const [node] = this.selectedNodes;
      this.$emit('goto:node', node);
      this.focusToCanvas();
    },
    onExecuteFromSelectedNode(): void {
      if (this.selectedNodes.length !== 1) return;
      const [node] = this.selectedNodes;
      this.$emit('execute-from:node', node);
      this.focusToCanvas();
    },
    onExecuteOneStepFromSelectedNode(): void {
      if (this.selectedNodes.length !== 1) return;
      const [node] = this.selectedNodes;
      this.$emit('execute-1-step-from:node', node);
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
        this.$emit('update:selectedNodeIds', this.flowchartGraph.nodes.map((d) => d.id));
        this.$emit('update:selectedEdgeIds', this.flowchartGraph.edges.map((d) => d.id));
      }
      if (key === 'Delete') {
        this.onRemoveSelected();
      }
    },
  },
});
</script>

<style scoped>
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

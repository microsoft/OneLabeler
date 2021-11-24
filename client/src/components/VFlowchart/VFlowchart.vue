<template>
  <svg
    ref="svg"
    :cursor="selectionBox === null ? undefined : 'crosshair'"
    @mousedown="onMouseDownCanvas"
    @mousemove="onMouseMoveCanvas"
    @mouseup="onMouseUpCanvas"
    @mouseleave="onMouseLeaveCanvas"
    @contextmenu="$emit('contextmenu', $event)"
  >
    <!-- The flowchart edges. -->
    <VEdge
      v-for="edge in [...edges].sort((a, b) => {
        // Render the selected edges later than unselected ones.
        if (selectedEdges.length === 0) return 1;
        if (selectedEdges.findIndex((d) => d.id === a.id) >= 0) return 1;
        if (selectedEdges.findIndex((d) => d.id === b.id) >= 0) return -1;
        return 0;
      })"
      :key="edge.id"
      :edge="edge"
      :source-node="getNodeFromPort(edge.source)"
      :target-node="getNodeFromPort(edge.target)"
      :color="getEdgeColor(edge)"
      @mousedown="onMouseDownEdge(edge, $event)"
      @contextmenu="$emit('contextmenu:edge', edge, $event)"
    />

    <!-- The new edge under creation. -->
    <VEdge
      v-if="draggedPort !== null"
      :edge="{
        source: draggedPort,
        target: hoveredPort === null ? undefined : hoveredPort,
      }"
      :source-node="getNodeFromPort(draggedPort)"
      :target-point="mousePosition"
      color="black"
    />

    <!-- The grid alignment guidelines. -->
    <VGuidelines
      v-if="enableGuideline && draggedNode !== null"
      :node="draggedNode"
      :nodes="nodes"
      :format="nodePositionFormatter"
      color="#a3a3a3"
    />

    <!-- The flowchart nodes. -->
    <VNode
      v-for="node in [...nodes].sort((a, b) => {
        // Render the selected nodes later than unselected ones.
        if (draggedNode === null) return 0;
        if (a.id === draggedNode.id) return 1;
        if (b.id === draggedNode.id) return -1;
        return 0;
      })"
      :key="node.id"
      :node="node"
      :is-hovered="hoveredNode !== null && hoveredNode.id === node.id"
      :is-selected="isNodeSelected(node)"
      :hovered-port="hoveredPort"
      @hover:node="hoveredNode = $event"
      @mousedown:node="onMouseDownNode"
      @leave:node="hoveredNode = null"
      @drag:port="draggedPort = $event"
    >
      <template #node="props">
        <slot
          name="node"
          v-bind="props"
        />
      </template>
    </VNode>

    <!-- The selection box -->
    <rect
      v-if="selectionBox !== null"
      :x="selectionBox.xMin"
      :y="selectionBox.yMin"
      :width="selectionBox.xMax - selectionBox.xMin"
      :height="selectionBox.yMax - selectionBox.yMin"
      stroke="#ababab"
      stroke-width="1"
      fill="black"
      fill-opacity="0.1"
    />
  </svg>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Box,
  Point,
  PortDirection,
  FlowchartEdge,
  FlowchartNode,
  FlowchartPort,
} from './types';
import {
  isPointInBox,
  getBBoxOfPoints,
  getZaggedPathPoints,
} from './geometry';
import VEdge from './VEdge.vue';
import VNode from './VNode.vue';
import VGuidelines from './VGuidelines.vue';

const isSuperset = (set: string[], subset: string[]) => (
  [...subset].every((d) => set.includes(d))
);

export default Vue.extend({
  name: 'VFlowchart',
  components: {
    VEdge,
    VNode,
    VGuidelines,
  },
  props: {
    nodes: {
      type: Array as PropType<FlowchartNode[]>,
      default: () => [] as FlowchartNode[],
    },
    edges: {
      type: Array as PropType<FlowchartEdge[]>,
      default: () => [] as FlowchartEdge[],
    },
    enableGuideline: {
      type: Boolean,
      default: true,
    },
    nodePositionFormatter: {
      type: Function as PropType<(d: number) => number>,
      default: (d: number) => Math.round(d / 10) * 10,
    },
  },
  data() {
    return {
      // The mouse position in svg when drag started.
      // The position is used by all the drag interactions:
      // box selection, node(s) dragging, edge creation.
      dragStartPoint: null as Point | null,
      // The mouse position in svg when drag moved.
      // The position is used by node(s) dragging.
      dragLastPoint: null as Point | null,
      draggedNodeId: null as string | null,
      draggedPort: null as FlowchartPort | null,
      // The ids of click selected and/or box selected nodes/edges.
      selectedNodeIds: [] as string[],
      selectedEdgeIds: [] as string[],
      hoveredNode: null as FlowchartNode | null,
      // The mouse position in svg. Get null when mouse leave svg.
      mousePosition: null as Point | null,
    };
  },
  computed: {
    draggedNode(): FlowchartNode | null {
      return this.nodes.find((d) => d.id === this.draggedNodeId) ?? null;
    },
    selectedNodes(): FlowchartNode[] {
      return this.nodes.filter((d) => this.isNodeSelected(d));
    },
    selectedEdges(): FlowchartEdge[] {
      return this.edges.filter((d) => this.isEdgeSelected(d));
    },
    selectionBox(): Box | null {
      const {
        dragStartPoint,
        draggedNode,
        draggedPort,
        mousePosition,
      } = this;
      if (
        dragStartPoint === null
        || mousePosition === null
        || draggedNode !== null
        || draggedPort !== null
        || ((dragStartPoint.x === mousePosition.x)
          && (dragStartPoint.y === mousePosition.y))
      ) return null;
      return getBBoxOfPoints([dragStartPoint, mousePosition]);
    },
    hoveredPort(): FlowchartPort | null {
      // The port within a distance threshold from the currently hovered position.
      if (this.mousePosition === null) return null;
      const { x, y } = this.mousePosition;
      const distanceThreshold = 10;
      const ports = ([] as FlowchartPort[])
        .concat(...this.nodes.map((node) => this.getPorts(node)))
        .filter((port) => {
          const pos = this.getPortPosition(port);
          if (pos === null) return false;
          return Math.hypot(pos.x - x, pos.y - y) < distanceThreshold;
        });
      return ports.length === 0 ? null : ports[0];
    },
  },
  watch: {
    selectedNodeIds(): void {
      // Emit the nodes selected by clicking or box selection.
      // Node: watch node ids instead of node themselves
      // to avoid infinite recursion in the parent component
      // when the parent component listens to select:nodes
      // and then edit nodes (causing select:nodes to be triggered again).
      this.$emit('select:nodes', this.selectedNodes);
    },
    selectedEdgeIds(): void {
      // Emit the edges selected by clicking or box selection.
      this.$emit('select:edges', this.selectedEdges);
    },
    nodes(): void {
      const validNodeIds = this.nodes.map((d) => d.id);
      if (isSuperset(validNodeIds, this.selectedNodeIds)) return;
      // When the nodes is updated, update the node selection.
      // Typically needed when a new graph is passed.
      this.selectedNodeIds = this.selectedNodeIds
        .filter((d) => validNodeIds.includes(d));
    },
    edges(): void {
      const validEdgeIds = this.edges.map((d) => d.id);
      if (isSuperset(validEdgeIds, this.selectedEdgeIds)) return;
      // When the edges is updated, update the edge selection.
      // Typically needed when a new graph is passed.
      this.selectedEdgeIds = this.selectedEdgeIds
        .filter((d) => validEdgeIds.includes(d));
    },
  },
  methods: {
    onEditNode(newValue: FlowchartNode): void {
      this.$emit('edit:node', newValue);
    },
    onCreateEdge(edge: FlowchartEdge): void {
      this.$emit('create:edge', edge);
    },
    onMouseDownEdge(edge: FlowchartEdge, event: MouseEvent): void {
      const { ctrlKey } = event;
      const isSelected = this.isEdgeSelected(edge);
      if (!ctrlKey && !isSelected) {
        this.selectedNodeIds = [];
        this.selectedEdgeIds = [edge.id];
      } else if (ctrlKey && isSelected) {
        this.selectedEdgeIds = this.selectedEdgeIds
          .filter((d) => d !== edge.id);
      } else if (ctrlKey && !isSelected) {
        this.selectedEdgeIds = [...this.selectedEdgeIds, edge.id];
      }
    },
    onMouseDownNode(node: FlowchartNode, event: MouseEvent): void {
      // MouseDown node triggers node:selection and node:draggstart.
      this.draggedNodeId = node.id;
      const { ctrlKey } = event;
      const isSelected = this.isNodeSelected(node);
      if (!ctrlKey && !isSelected) {
        this.selectedEdgeIds = [];
        this.selectedNodeIds = [node.id];
      } else if (ctrlKey && isSelected) {
        this.selectedNodeIds = this.selectedNodeIds
          .filter((d) => d !== node.id);
        this.draggedNodeId = null;
      } else if (ctrlKey && !isSelected) {
        this.selectedNodeIds = [...this.selectedNodeIds, node.id];
      }
    },
    onMouseDownCanvas(e: MouseEvent): void {
      if (!e.ctrlKey && e.target === this.$refs.svg) {
        this.selectedNodeIds = [];
        this.selectedEdgeIds = [];
      }
      this.dragStartPoint = { x: e.offsetX, y: e.offsetY };
      this.dragLastPoint = { x: e.offsetX, y: e.offsetY };
    },
    onMouseMoveCanvas(e: MouseEvent): void {
      // MouseMove canvas triggers node:drag (if there exists selected nodes(s))
      // and edge:creating (if there exists dragged port).
      const {
        draggedNode,
        dragStartPoint,
        dragLastPoint,
      } = this;

      // record mouse position
      const mousePosition: Point = { x: e.offsetX, y: e.offsetY };
      this.mousePosition = mousePosition;

      // node on:drag
      if (draggedNode !== null
        && dragStartPoint !== null
        && dragLastPoint !== null
      ) {
        // move all the selected nodes
        const dx = mousePosition.x - dragLastPoint.x;
        const dy = mousePosition.y - dragLastPoint.y;
        this.selectedNodes.forEach((node) => {
          this.onEditNode({
            ...node,
            x: node.x + dx,
            y: node.y + dy,
          });
        });
        this.dragLastPoint = mousePosition;
      }
    },
    onMouseUpCanvas(): void {
      // finish box selection
      const { selectionBox } = this;
      if (selectionBox !== null) {
        this.selectedNodeIds = this.nodes.filter((node) => {
          const {
            x,
            y,
            width,
            height,
          } = node;
          const points: Point[] = [
            { x, y },
            { x, y: y + height },
            { x: x + width, y },
            { x: x + width, y: y + height },
          ];
          return points.every((p) => isPointInBox(p, selectionBox));
        }).map((d) => d.id);
        this.selectedEdgeIds = this.edges.filter((edge) => {
          const points: Point[] = this.getEdgePathPoints(edge)
            .map(([x, y]) => ({ x, y }));
          return points.every((p) => isPointInBox(p, selectionBox));
        }).map((d) => d.id);
      }

      // node on:drag-end
      const { draggedNode } = this;
      const { nodePositionFormatter } = this as {
        nodePositionFormatter: (d: number) => number
      };
      if (draggedNode !== null) {
        this.selectedNodes.forEach((node) => {
          const x = nodePositionFormatter(node.x);
          const y = nodePositionFormatter(node.y);
          if (x !== node.x || y !== node.y) {
            this.onEditNode({ ...node, x, y });
          }
        });
      }

      // edge on:create-end
      const target = this.hoveredPort;
      const source = this.draggedPort;
      if (source !== null && target !== null) {
        this.onCreateEdge({
          id: `${source.nodeId}-${source.direction}-${target.nodeId}-${target.direction}`,
          source,
          target,
        });
      }
      this.clearDragState();
    },
    onMouseLeaveCanvas(): void {
      this.mousePosition = null;
      this.clearDragState();
    },
    clearDragState(): void {
      this.dragStartPoint = null;
      this.dragLastPoint = null;
      this.draggedNodeId = null;
      this.draggedPort = null;
    },
    getNodeFromPort(port: FlowchartPort): FlowchartNode | null {
      return this.nodes.find((d) => d.id === port.nodeId) ?? null;
    },
    getPorts(node: FlowchartNode): FlowchartPort[] {
      if (node.ports !== undefined) return node.ports;
      const { width, height } = node;
      return [{
        nodeId: node.id,
        direction: PortDirection.Top,
        dx: width / 2,
        dy: 0,
      }, {
        nodeId: node.id,
        direction: PortDirection.Left,
        dx: 0,
        dy: height / 2,
      }, {
        nodeId: node.id,
        direction: PortDirection.Bottom,
        dx: width / 2,
        dy: height,
      }, {
        nodeId: node.id,
        direction: PortDirection.Right,
        dx: width,
        dy: height / 2,
      }];
    },
    getPortPosition(port: FlowchartPort): Point | null {
      const node = this.nodes.find((d) => d.id === port.nodeId);
      if (node === undefined) return null;
      return {
        x: node.x + port.dx,
        y: node.y + port.dy,
      };
    },
    getEdgePathPoints(edge: FlowchartEdge): [number, number][] {
      const { source, target } = edge;
      const sourcePosition = this.getPortPosition(source);
      const targetPosition = this.getPortPosition(target);
      if (sourcePosition === null || targetPosition === null) return [];
      const points = getZaggedPathPoints(
        {
          x1: sourcePosition.x,
          y1: sourcePosition.y,
          x2: targetPosition.x,
          y2: targetPosition.y,
        },
        source.direction,
        target.direction,
      );
      return points;
    },
    getEdgeColor(edge: FlowchartEdge): string {
      if (this.isEdgeSelected(edge)) return 'black';
      if (edge.condition === undefined) return '#bbb';
      if (edge.condition === true) return '#5aaf4b';
      if (edge.condition === false) return '#f5504e';
      return '#bbb';
    },
    isNodeSelected(node: FlowchartNode): boolean {
      return this.selectedNodeIds.findIndex((id) => id === node.id) >= 0;
    },
    isEdgeSelected(edge: FlowchartEdge): boolean {
      return this.selectedEdgeIds.findIndex((id) => id === edge.id) >= 0;
    },
  },
});
</script>

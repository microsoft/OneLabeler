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
    <g
      v-for="edge in [...edges].sort((a, b) => {
        // Render the selected edges later than unselected ones.
        if (selectedEdges.length === 0) return 1;
        if (selectedEdges.findIndex((d) => d.id === a.id) >= 0) return 1;
        if (selectedEdges.findIndex((d) => d.id === b.id) >= 0) return -1;
        return 0;
      })"
      :key="edge.id"
      cursor="pointer"
      @mousedown="onMouseDownEdge(edge, $event)"
      @contextmenu.stop="$emit('contextmenu:edge', edge, $event)"
    >
      <slot
        name="edge"
        :edge="edge"
        :is-selected="isEdgeSelected(edge)"
      >
        <!-- The visible edge. -->
        <path
          :d="`M${getEdgePathPoints(edge).map((d) => d.join(',')).join('L')}`"
          :stroke="getEdgeColor(edge)"
          stroke-width="1"
          fill="none"
          :marker-end="`url(#${
            isEdgeSelected(edge) ? markerIdOfSelected : markerIdOfUnselected
          })`"
        />

        <!-- The invisible widened edge to make the edge easier to select. -->
        <path
          :d="`M${getEdgePathPoints(edge).map((d) => d.join(',')).join('L')}`"
          stroke="transparent"
          stroke-width="10"
          fill="none"
        />
      </slot>
    </g>

    <!-- The new edge under creation. -->
    <path
      v-if="partialNewEdgePoints !== null"
      :d="`M${partialNewEdgePoints.map((d) => d.join(',')).join('L')}`"
      stroke="black"
      storke-width="1"
      fill="none"
      :marker-end="`url(#${markerIdOfSelected})`"
    />

    <!-- The grid alignment guidelines. -->
    <path
      v-for="(line, i) in guidelines"
      :key="i"
      :d="`M${line.x1},${line.y1}L${line.x2},${line.y2}`"
      stroke-width="1"
      stroke="#a3a3a3"
      fill="none"
      stroke-dasharray="5,3"
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
      :is-hovered="isNodeHovered(node)"
      :is-selected="isNodeSelected(node)"
      :is-dragged="isNodeDragged(node)"
      :hovered-port="hoveredPort"
      @hover:node="onMouseOverNode"
      @mousedown:node="onMouseDownNode"
      @leave:node="onMouseLeaveNode"
      @drag:port="onMouseDownPort"
    >
      <template #node-shape>
        <slot
          name="node-shape"
          :node="node"
          :is-selected="isNodeSelected(node)"
        >
          <rect
            :width="node.width"
            :height="node.height"
            :stroke="isNodeSelected(node) ? 'black' : '#bbb'"
            fill-opacity="0"
            stroke-width="1"
          />
        </slot>
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

    <!-- The edge arrow head. -->
    <marker
      :id="markerIdOfSelected"
      viewBox="0 -5 10 10"
      refX="10"
      refY="-0.5"
      markerWidth="10"
      markerHeight="10"
      orient="auto"
    >
      <path
        d="M0,-5L10,0L0,5"
        fill="black"
      />
    </marker>
    <marker
      :id="markerIdOfUnselected"
      viewBox="0 -5 10 10"
      refX="10"
      refY="-0.5"
      markerWidth="10"
      markerHeight="10"
      orient="auto"
    >
      <path
        d="M0,-5L10,0L0,5"
        fill="#bbb"
      />
    </marker>
  </svg>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Box,
  Line,
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
import VNode from './VNode.vue';

const isSuperset = (set: string[], subset: string[]) => (
  [...subset].every((d) => set.includes(d))
);

export default Vue.extend({
  name: 'VFlowchart',
  components: {
    VNode,
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
      markerIdOfSelected: 'arrow-head-selected',
      markerIdOfUnselected: 'arrow-head-unselected',
      // The mouse position in svg when drag started.
      // The position is used by all the drag interactions:
      // box selection, node(s) dragging, edge creation.
      dragStartPoint: null as Point | null,
      // The mouse position in svg when drag moved.
      // The position is used by node(s) dragging.
      dragLastPoint: null as Point | null,
      draggedNodeId: null as string | null,
      draggedPort: null as FlowchartPort | null,
      // The points of the new edge under creation
      // linking the dragged port to the current mouse position.
      partialNewEdgePoints: null as null | [number, number][],
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
      const node = this.nodes.find(
        (d: FlowchartNode) => d.id === this.draggedNodeId,
      );
      return node ?? null;
    },
    selectedNodes(): FlowchartNode[] {
      return this.nodes.filter((d) => this.isNodeSelected(d));
    },
    selectedEdges(): FlowchartEdge[] {
      return this.edges.filter((d) => this.isEdgeSelected(d));
    },
    guidelines(): Line[] {
      if (!this.enableGuideline) return [];
      const node = this.draggedNode;
      if (node === null) return [];
      const { nodePositionFormatter } = this as {
        nodePositionFormatter: (d: number) => number
      };
      const xMin = node.x;
      const xMax = node.x + node.width;
      const yMin = node.y;
      const yMax = node.y + node.height;
      const xMinRound = nodePositionFormatter(xMin);
      const xMaxRound = nodePositionFormatter(xMax);
      const yMinRound = nodePositionFormatter(yMin);
      const yMaxRound = nodePositionFormatter(yMax);
      const guidelines: Line[] = [];
      this.nodes.forEach((d) => {
        if (d.id === node.id) return;
        [xMinRound, xMaxRound].forEach((xRound) => {
          if (d.x !== xRound) return;
          if (d.y < yMinRound) {
            guidelines.push({
              x1: d.x,
              y1: d.y + d.height,
              x2: d.x,
              y2: yMinRound,
            });
          } else {
            guidelines.push({
              x1: d.x,
              y1: yMinRound + d.height,
              x2: d.x,
              y2: d.y,
            });
          }
        });
        [yMinRound, yMaxRound].forEach((yRound) => {
          if (d.y !== yRound) return;
          if (d.x < xMinRound) {
            guidelines.push({
              x1: d.x + d.width,
              y1: d.y,
              x2: xMinRound,
              y2: d.y,
            });
          } else {
            guidelines.push({
              x1: xMinRound + d.width,
              y1: d.y,
              x2: d.x,
              y2: d.y,
            });
          }
        });
      });
      return guidelines;
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
    onMouseOverNode(node: FlowchartNode): void {
      this.hoveredNode = node;
    },
    onMouseLeaveNode(): void {
      this.hoveredNode = null;
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

      // edge on:creating
      const { draggedPort, hoveredPort } = this;
      if (draggedPort !== null) {
        const sourcePosition = this.getPortPosition(draggedPort);
        if (sourcePosition !== null) {
          // compute points on the partially created edge
          const points = getZaggedPathPoints(
            {
              x1: sourcePosition.x,
              y1: sourcePosition.y,
              x2: mousePosition.x,
              y2: mousePosition.y,
            },
            draggedPort.direction,
            hoveredPort === null ? undefined : hoveredPort.direction,
          );
          this.partialNewEdgePoints = points;
        }
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
    onMouseDownPort(port: FlowchartPort): void {
      // port on:drag-start
      this.draggedPort = port;
    },
    clearDragState(): void {
      this.dragStartPoint = null;
      this.dragLastPoint = null;
      this.draggedNodeId = null;
      this.draggedPort = null;
      this.partialNewEdgePoints = null;
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
    isNodeHovered(node: FlowchartNode): boolean {
      if (this.hoveredNode === null) return false;
      return this.hoveredNode.id === node.id;
    },
    isNodeSelected(node: FlowchartNode): boolean {
      return this.selectedNodeIds.findIndex((id) => id === node.id) >= 0;
    },
    isNodeDragged(node: FlowchartNode): boolean {
      if (this.draggedNodeId === null) return false;
      return this.draggedNodeId === node.id;
    },
    isEdgeSelected(edge: FlowchartEdge): boolean {
      return this.selectedEdgeIds.findIndex((id) => id === edge.id) >= 0;
    },
  },
});
</script>

import { v4 as uuidv4 } from 'uuid';
import {
  PortDirection,
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';

/** Get default { width, height } for a node given node type. */
const getDefaultNodeSize = (
  type: WorkflowNodeType,
): { width: number, height: number } => {
  const INITIAL_NODE_WIDTH = 80;
  const INITIAL_NODE_HEIGHT = 60;
  const DECISION_NODE_WIDTH = 80;
  const DECISION_NODE_HEIGHT = 60;
  const EXIT_NODE_WIDTH = 60;
  const EXIT_NODE_HEIGHT = 60;
  const MODULE_NODE_WIDTH = 80;
  const MODULE_NODE_HEIGHT = 60;

  let width = MODULE_NODE_WIDTH;
  let height = MODULE_NODE_HEIGHT;
  if (type === WorkflowNodeType.Initialization) {
    [width, height] = [INITIAL_NODE_WIDTH, INITIAL_NODE_HEIGHT];
  }
  if (type === WorkflowNodeType.Decision) {
    [width, height] = [DECISION_NODE_WIDTH, DECISION_NODE_HEIGHT];
  }
  if (type === WorkflowNodeType.Exit) {
    [width, height] = [EXIT_NODE_WIDTH, EXIT_NODE_HEIGHT];
  }
  return { width, height };
};

/** Get default { x, y } for a node given node index. */
const getDefaultNodePosition = (idx: number) => {
  const DEFAULT_NODE_WIDTH = 80;
  const DEFAULT_NODE_HEIGHT = 80;
  const DEFAULT_CANVAS_WIDTH = 600;
  const DEFAULT_MARGIN = 40;
  const DEFAULT_NODES_PER_ROW = Math.floor((DEFAULT_CANVAS_WIDTH - DEFAULT_MARGIN)
    / (DEFAULT_NODE_WIDTH + DEFAULT_MARGIN));

  const rowIdx = Math.floor(idx / DEFAULT_NODES_PER_ROW);
  const columnIdx = idx - DEFAULT_NODES_PER_ROW * rowIdx;
  const x = columnIdx * DEFAULT_NODE_WIDTH + (columnIdx + 1) * DEFAULT_MARGIN;
  const y = rowIdx * DEFAULT_NODE_HEIGHT + (rowIdx + 1) * DEFAULT_MARGIN;
  return { x, y };
};

/** Assign assign default values to node layout if not provided. */
export const parseNodeLayout = (
  layout: Partial<WorkflowNode['layout']> | undefined,
  type: WorkflowNodeType,
  idx: number,
): WorkflowNode['layout'] => {
  const { width: defaultWidth, height: defaultHeight } = getDefaultNodeSize(type);
  const { x: defaultX, y: defaultY } = getDefaultNodePosition(idx);

  const width = layout?.width ?? defaultWidth;
  const height = layout?.height ?? defaultHeight;
  const x = layout?.x ?? defaultX;
  const y = layout?.y ?? defaultY;

  return {
    ...layout,
    width,
    height,
    x,
    y,
  };
};

/**
 * Compute the angle in [0, 360) for a vector (dx, dy)
 * with regards to x-axis direction.
 */
const getAngle = (dx: number, dy: number): number => {
  const radian = Math.atan2(dy, dx);
  const degree = (180 * radian) / Math.PI;
  return (360 + Math.round(degree)) % 360;
};

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

/** Get default port position given node size and port direction. */
const getDefaultPortPosition = (
  direction: PortDirection,
  nodeSize: { width: number, height: number },
): { dx: number, dy: number } => {
  const { width, height } = nodeSize;
  if (direction === PortDirection.Left) return { dx: 0, dy: height / 2 };
  if (direction === PortDirection.Right) return { dx: width, dy: height / 2 };
  if (direction === PortDirection.Top) return { dx: width / 2, dy: 0 };
  if (direction === PortDirection.Bottom) return { dx: width / 2, dy: height };
  throw new TypeError(`Invalid port direction: ${direction}`);
};

/** Get default [source, target] port direction given the angle in [0, 360). */
const getDefaultPortDirections = (
  angle: number,
): [PortDirection, PortDirection] => {
  // source on the left, target on the right
  if ((angle >= 0 && angle <= 45)
    || (angle > 315 && angle < 360)) return [PortDirection.Right, PortDirection.Left];
  // source on the bottom, target on the top
  if (angle <= 135 && angle > 45) return [PortDirection.Top, PortDirection.Bottom];
  // source on the right, target on the left
  if (angle <= 225 && angle >= 135) return [PortDirection.Left, PortDirection.Right];
  // source on the top, target on the bottom
  if (angle <= 315 && angle >= 225) return [PortDirection.Bottom, PortDirection.Top];
  throw new TypeError(`Invalid angle: ${angle}`);
};

/**
 * Assign default values to edge layout if not provided.
 * 1. if all attributes exist in layout
 *  return original layout
 * 2. if source/target direction exist in layout
 *  return layout with default source/target x, y
 * 3. otherwise
 *  return a default layout without using the original layout
 */
export const parseEdgeLayout = (
  layout: RecursivePartial<WorkflowEdge['layout']> | undefined,
  sourceNode: WorkflowNode,
  targetNode: WorkflowNode,
): WorkflowEdge['layout'] => {
  const [
    defaultSourceDirection,
    defaultTargetDirection,
  ] = getDefaultPortDirections(getAngle(
    targetNode.layout.x - sourceNode.layout.x,
    sourceNode.layout.y - targetNode.layout.y,
  ));
  let source = { direction: defaultSourceDirection, ...layout?.source };
  let target = { direction: defaultTargetDirection, ...layout?.target };
  source = { ...getDefaultPortPosition(source.direction, sourceNode.layout), ...source };
  target = { ...getDefaultPortPosition(target.direction, targetNode.layout), ...target };
  return { source, target } as WorkflowEdge['layout'];
};

const parseNode = (
  node: Partial<WorkflowNode> & Omit<WorkflowNode, 'layout' | 'id'>,
  idx: number,
): WorkflowNode => {
  // Create node.layout if layout doesn't exist.
  const layout = parseNodeLayout(node.layout, node.type, idx);

  return {
    ...node,
    // Use node.label as node.id if id doesn't exist.
    id: node.id ?? node.label,
    layout,
  };
};

const parseEdge = (
  edge: Partial<WorkflowEdge> & Omit<WorkflowEdge, 'id'>,
  nodes: WorkflowNode[],
): WorkflowEdge => {
  // Create edge.id if id doesn't exist.
  const id = edge.id ?? uuidv4();

  // Create edge.layout if layout doesn't exist.
  const sourceNode = nodes.find((d) => d.id === edge.source) as WorkflowNode;
  const targetNode = nodes.find((d) => d.id === edge.target) as WorkflowNode;
  const layout = parseEdgeLayout(edge.layout, sourceNode, targetNode);
  return { ...edge, id, layout };
};

export const parseWorkflowGraph = (graph: WorkflowGraph): WorkflowGraph => {
  const nodes = graph.nodes.map((node, i) => parseNode(node, i));
  const edges = graph.edges.map((edge) => parseEdge(edge, nodes));
  const { label } = graph;
  return { nodes, edges, label };
};

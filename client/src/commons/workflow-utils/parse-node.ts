import {
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import type { TrimmedProcess } from './parse-process';
import { parseProcess } from './parse-process';

export type TrimmedNode = Partial<WorkflowNode> & Omit<WorkflowNode, 'id' | 'layout'>;

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
const parseNodeLayout = (
  layout: Partial<WorkflowNode['layout']> | undefined,
  type: WorkflowNodeType,
  idx: number,
): WorkflowNode['layout'] => {
  const { width, height } = getDefaultNodeSize(type);
  const { x, y } = getDefaultNodePosition(idx);
  return {
    width,
    height,
    x,
    y,
    ...layout,
  };
};

const parseNodeValue = (
  value: TrimmedNode['value'],
  node: TrimmedNode,
): WorkflowNode['value'] => {
  if (
    node.type === WorkflowNodeType.Decision
    || node.type === WorkflowNodeType.Exit
    || node.type === WorkflowNodeType.Initialization
  ) return value;

  if (value === null || value === undefined) {
    throw new Error(`node value empty: node = ${node}`);
  }

  if (Array.isArray(value)) {
    return value.map((d: TrimmedProcess) => parseProcess(d, node));
  }
  return parseProcess(value as TrimmedProcess, node);
};

export const parseNode = (
  node: TrimmedNode,
  idx: number,
): WorkflowNode => ({
  ...node,
  // Use node.label as node.id if id doesn't exist.
  id: node.id ?? node.label,
  // Create node.layout if layout doesn't exist.
  layout: parseNodeLayout(node.layout, node.type, idx),
  value: parseNodeValue(node.value, node),
});

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowNode } from '@/commons/types';
import type { IModuleTrimmed } from './parse-module';
import { parseModule } from './parse-module';

export type TrimmedNode = Partial<WorkflowNode> & Omit<WorkflowNode, 'id' | 'layout'>;

/** Get default { width, height } for a node given node type. */
export const getDefaultNodeSize = (
  type: WorkflowNodeType,
): { width: number, height: number } => {
  const INITIAL_NODE_WIDTH = 120;
  const INITIAL_NODE_HEIGHT = 80;
  const DECISION_NODE_WIDTH = 120;
  const DECISION_NODE_HEIGHT = 80;
  const EXIT_NODE_WIDTH = 120;
  const EXIT_NODE_HEIGHT = 80;
  const MODULE_NODE_WIDTH = 120;
  const MODULE_NODE_HEIGHT = 80;

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

export const parseNode = (
  node: TrimmedNode,
  idx: number,
): WorkflowNode => ({
  ...node,
  // Use node.label as node.id if id doesn't exist.
  id: node.id ?? node.label,
  // Create node.layout if layout doesn't exist.
  layout: parseNodeLayout(node.layout, node.type, idx),
  value: parseModule(node.value as IModuleTrimmed | undefined, node),
});

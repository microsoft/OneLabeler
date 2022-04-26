// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowNode } from '@/commons/types';
import type BaseModule from '@/builtins/modules/base-module';
import type { IModuleTrimmed } from './parse-module';
import { parseModule } from './parse-module';

export type TrimmedNode = {
  /** The id of the node. */
  id?: string;
  /** The name of the node as appear in the interface. */
  label: string;
  type: WorkflowNodeType;
  /** The chosen implementation (null when not chosen). */
  value?: BaseModule | null;
  /**
   * The layout specifying where the node should
   * be rendered and the size of the node.
   */
  layout?: {
    /** The position of the top left corner of the node. */
    x: number;
    y: number;
    /** The size of the node. */
    width?: number;
    height?: number;
  };
}

/** Get default { width, height } for a node given node type. */
export const getDefaultNodeSize = (
  type: WorkflowNodeType,
): { width: number, height: number } => {
  const NODE_WIDTH = 120;
  const NODE_HEIGHT = 80;
  return { width: NODE_WIDTH, height: NODE_HEIGHT };
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

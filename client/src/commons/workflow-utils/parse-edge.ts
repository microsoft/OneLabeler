// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuidv4 } from 'uuid';
import { PortDirection } from '@/commons/types';
import type { WorkflowEdge, WorkflowNode } from '@/commons/types';

export type TrimmedEdge = Partial<WorkflowEdge> & Omit<WorkflowEdge, 'id' | 'layout'>
type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]>; };

/**
 * Compute the angle in [0, 360) for a vector (dx, dy)
 * with regards to x-axis direction.
 */
const getAngle = (dx: number, dy: number): number => {
  const radian = Math.atan2(dy, dx);
  const degree = (180 * radian) / Math.PI;
  return (360 + Math.round(degree)) % 360;
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
const parseEdgeLayout = (
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
  source = {
    ...getDefaultPortPosition(source.direction, sourceNode.layout),
    ...source,
  };
  target = {
    ...getDefaultPortPosition(target.direction, targetNode.layout),
    ...target,
  };
  return { source, target } as WorkflowEdge['layout'];
};

/** Convert trimmed edge to workflow edge data structure. */
export const parseEdge = (
  edge: TrimmedEdge,
  nodes: WorkflowNode[],
): WorkflowEdge => {
  // Create edge.id if id doesn't exist.
  const id = edge.id ?? uuidv4();

  // Create edge.layout if layout data structure not complete.
  const sourceNode = nodes.find((d) => d.id === edge.source);
  const targetNode = nodes.find((d) => d.id === edge.target);
  if (sourceNode === undefined) throw new Error(`Edge source invalid: ${edge}`);
  if (targetNode === undefined) throw new Error(`Edge source invalid: ${edge}`);
  const layout = parseEdgeLayout(edge.layout, sourceNode, targetNode);
  return { ...edge, id, layout };
};

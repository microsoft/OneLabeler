// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface Box {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Point {
  x: number;
  y: number;
}

/** The enum of port direction types. */
export enum PortDirection {
  Top = 'Top',
  Left = 'Left',
  Bottom = 'Bottom',
  Right = 'Right',
}

/**
 * The port on a node that can connect edges.
 * @apiNote Store nodeId instead of a node object to
 * avoid the need to explicitly synchronizing the node
 * after editing the node.
 */
export interface FlowchartPort {
  /** The id of node containing the port. */
  nodeId: string;
  /** The direction of the port in the node. */
  direction: PortDirection;
  /** The relative position of the port to the node's (xMin, yMin). */
  dx: number;
  dy: number;
}

export interface FlowchartNode {
  id: string;
  /** The text label of the node. */
  label: string;
  /** The (xMin, yMin) of the node */
  x: number;
  y: number;
  /** The size of the node. */
  width: number;
  height: number;
  ports?: FlowchartPort[];
  /** Allow additional properties. */
  [x: string]: unknown;
}

export interface FlowchartEdge {
  id: string;
  source: FlowchartPort;
  target: FlowchartPort;
  condition?: boolean;
}

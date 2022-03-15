// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Konva from 'konva';
import type { ComponentInstance } from '@vue/composition-api';

export enum MouseOperationType {
  PanAndZoom = 'PanAndZoom',
  PaintBrush = 'PaintBrush',
  PaintErase = 'PaintErase',
  EditShape = 'EditShape',
  ClickCreatePolygon = 'ClickCreatePolygon',
  ClickCreateRect = 'ClickCreateRect',
  ClickCreatePoint = 'ClickCreatePoint',
  LassoCreatePolygon = 'LassoCreatePolygon',
  ScissorsCreatePolygon = 'ScissorsCreatePolygon',
}

export enum StrokeShapeType {
  Circle = 'Circle',
  Square = 'Square',
}

export interface IEditableShape {
  /** Get whether the circle is editable. */
  editable(): boolean;
  /** Set whether the circle is editable. */
  editable(value: boolean): this;

  /** Get the shape node. */
  getNode(): Konva.Node;

  /** Set the circle to be in the editing state. */
  startEdit(): void;

  /** Set the circle to be not in the editing state. */
  endEdit(): void;

  /** Set the callback when the circle position is updated. */
  setOnUpdatePosition(value: (d: IEditableShape) => void): this;

  /** Set the callback when the circle is clicked. */
  setOnClick(value: (d: IEditableShape) => void): this;
}

export type VueKonvaLayer = ComponentInstance & { getNode: () => Konva.Layer };

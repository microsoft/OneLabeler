// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Konva from 'konva';

export const createCircle15x15 = (): Konva.Shape => new Konva.Shape({
  sceneFunc(context, shape) {
    let width = shape.getAttr('width');
    let height = shape.getAttr('height');
    const size = 15;
    width /= size;
    height /= size;

    const pts = [
      [4, 0],
      [11, 0],
      [11, 1],
      [13, 1],
      [13, 2],
      [14, 2],
      [14, 4],
      [15, 4],
      [15, 11],
      [14, 11],
      [14, 13],
      [13, 13],
      [13, 14],
      [11, 14],
      [11, 15],
      [4, 15],
      [4, 14],
      [2, 14],
      [2, 13],
      [1, 13],
      [1, 11],
      [0, 11],
      [0, 4],
      [1, 4],
      [1, 2],
      [2, 2],
      [2, 1],
      [4, 1],
    ];

    context.beginPath();
    pts.forEach(([x, y]) => {
      context.lineTo(width * x, height * y);
    });
    context.closePath();

    context.fillStrokeShape(shape);
  },
  fill: '#00D2FF',
  strokeWidth: 0,
  width: 15,
  height: 15,
});

export const createCircle5x5 = (): Konva.Shape => new Konva.Shape({
  sceneFunc(context, shape) {
    let width = shape.getAttr('width');
    let height = shape.getAttr('height');
    const size = 5;
    width /= size;
    height /= size;

    const pts = [
      [1, 0],
      [3, 0],
      [3, 1],
      [4, 1],
      [4, 3],
      [3, 3],
      [3, 4],
      [1, 4],
      [1, 3],
      [0, 3],
      [0, 1],
      [1, 1],
    ];

    context.beginPath();
    pts.forEach(([x, y]) => {
      context.lineTo(width * x, height * y);
    });
    context.closePath();

    context.fillStrokeShape(shape);
  },
  fill: '#00D2FF',
  strokeWidth: 0,
  width: 5,
  height: 5,
});

export const createCircle1x1 = (): Konva.Shape => new Konva.Rect({
  fill: '#00D2FF',
  strokeWidth: 0,
  width: 1,
  height: 1,
});

export const createCircle = (size: (1 | 5 | 15)): Konva.Shape => {
  if (size === 1) return createCircle1x1();
  if (size === 5) return createCircle5x5();
  if (size === 15) return createCircle15x15();
  throw new TypeError(`Invalid size: ${size}`);
};

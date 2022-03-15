// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as BABYLON from 'babylonjs';
import type { Ref } from '@vue/composition-api';
import type { Vector3d } from '@/commons/types';

type Point = [number, number];

type UseGetPoints2dReturn = {
  getPoints2d: () => Point[] | null,
};

// Get the getter of 2d position of points on screen.
const useGetPoints2d = (
  points: Ref<Vector3d[] | null>,
  camera: Ref<BABYLON.Camera | null>,
  canvas: Ref<HTMLCanvasElement | null>,
): UseGetPoints2dReturn => {
  const project = (point: BABYLON.Vector3): BABYLON.Vector2 => {
    if (camera.value === null) throw Error('Camera not initialized');
    if (canvas.value === null) throw Error('Canvas not initialized');
    const viewport = camera.value.viewport.toGlobal(
      canvas.value.width,
      canvas.value.height,
    );
    const vector = BABYLON.Vector3.Project(
      point,
      BABYLON.Matrix.Identity(),
      camera.value.getTransformationMatrix(),
      viewport,
    );
    return new BABYLON.Vector2(vector.x, vector.y);
  };

  const getPoints2d = (): Point[] | null => {
    if (points.value === null) return null;
    const points2d = points.value
      .map((d) => project(new BABYLON.Vector3(d[0], d[1], d[2])))
      .map((d) => [d.x, d.y] as Point);
    return points2d;
  };

  return { getPoints2d };
};

export default useGetPoints2d;

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as BABYLON from 'babylonjs';
import type { Category, Vector3d } from '@/commons/types';

// Register point cloud system to scene.
const createPointCloudSystem = (
  scene: BABYLON.Scene | null,
  points: Vector3d[] | null,
  pointLabels: string[] | null,
  label2color: ((label: Category) => string) | null,
): BABYLON.PointsCloudSystem | null => {
  if (scene === null || points === null) return null;

  const POINT_SIZE = 3;
  const DEFAULT_COLOR = '#FFFFFF';

  const pcs = new BABYLON.PointsCloudSystem('pcs', POINT_SIZE, scene);
  const pointFunc = (particle: BABYLON.CloudPoint) => {
    const { idx } = particle;
    pcs.particles[idx].position = new BABYLON.Vector3(...points[idx]);
    const colorHex = (pointLabels !== null && label2color !== null)
      ? label2color(pointLabels[idx])
      : DEFAULT_COLOR;
    pcs.particles[idx].color = BABYLON.Color4.FromColor3(
      BABYLON.Color3.FromHexString(colorHex),
    );
  };
  pcs.addPoints(points.length, pointFunc);
  pcs.buildMeshAsync();

  return pcs;
};

export default createPointCloudSystem;

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Ref, watch } from '@vue/composition-api';
import { PointsCloudSystem } from 'babylonjs';
import type { Category } from '@/commons/types';

// Update point colors when pointLabels or label2color changes.
const usePointColors = (
  pcs: Ref<PointsCloudSystem | null>,
  pointLabels: Ref<Category[] | null>,
  label2color: Ref<((category: Category) => string) | null>,
): void => {
  // Update point colors according to point labels.
  const setPointColors = (): void => {
    if (
      pcs.value === null
      || pointLabels.value === null
      || label2color.value === null
    ) return;

    for (let i = 0; i < pcs.value.particles.length; i += 1) {
      const colorHex = label2color.value(pointLabels.value[i]);
      // eslint-disable-next-line no-param-reassign
      pcs.value.particles[i].color = BABYLON.Color4.FromColor3(
        BABYLON.Color3.FromHexString(colorHex),
      );
    }
  };

  const renderPointColors = (): void => {
    setPointColors();
    pcs.value?.setParticles();
  };

  watch(pointLabels, renderPointColors);
  watch(label2color, renderPointColors);
};

export default usePointColors;

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { xor4096 } from 'seedrandom';
import { ModuleType } from '@/commons/types';
import type { IDataObjectStorage } from '@/commons/types';

export default {
  type: ModuleType.FeatureExtraction,
  label: 'Random3D (Debug)',
  id: 'Random-87333124',
  inputs: ['dataObjects', 'queryUuids'],
  outputs: ['features'],
  blocking: true,
  isBuiltIn: true,
  isServerless: true,
  run: async (
    inputs: {
      dataObjects: IDataObjectStorage,
      queryUuids: string[],
    },
  ): Promise<{ features: number[][] }> => {
    const { dataObjects, queryUuids } = inputs;
    const SEED = '20';
    const random = xor4096(SEED);

    const nPoints = queryUuids.length === 0
      ? await dataObjects.count()
      : queryUuids.length;
    const features = Array(nPoints).fill(null)
      .map(() => [random(), random(), random()]);
    return { features };
  },
};

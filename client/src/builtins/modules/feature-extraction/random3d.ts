// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { xor4096 } from 'seedrandom';
import { ModuleType } from '@/commons/types';
import type { IDataObjectStorage } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';

const SEED = '20';
const random = xor4096(SEED);

export default class Random3D extends BaseModule {
  readonly inputs = ['dataObjects', 'queryUuids'];

  readonly outputs = ['features'];

  readonly id = 'FeatureExtraction-Random';

  readonly label = 'Random3D (Dummy)';

  readonly type = ModuleType.FeatureExtraction;

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  readonly run = async (
    inputs: {
      dataObjects: IDataObjectStorage,
      queryUuids: string[],
    },
  ): Promise<{ features: number[][] }> => {
    const { dataObjects, queryUuids } = inputs;

    const nPoints = queryUuids.length === 0
      ? await dataObjects.count()
      : queryUuids.length;
    const features = Array(nPoints).fill(null)
      .map(() => [random(), random(), random()]);
    return { features };
  }
}

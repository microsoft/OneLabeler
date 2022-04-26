// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { xor4096 } from 'seedrandom';
import { LabelTaskType, ModuleType } from '@/commons/types';
import type { ILabel } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';

const SEED = '20';
const random = xor4096(SEED);

export default class Random extends BaseModule {
  readonly inputs = ['queryUuids', 'categories'];

  readonly outputs = ['labels'];

  readonly id = 'DefaultLabeling-Random';

  readonly label = 'Random (Debug)';

  readonly type = ModuleType.DefaultLabeling;

  readonly labelTasks = [LabelTaskType.Classification];

  readonly isBuiltIn = true;

  readonly isServerless = true;

  readonly run = async (
    inputs: {
      queryUuids: string[],
      categories: string[],
    },
  ): Promise<{ labels: ILabel[] }> => {
    const { queryUuids, categories } = inputs;
    const nCategories = categories.length;
    const labels = queryUuids.map((d) => ({
      uuid: d,
      category: categories[Math.floor(random() * nCategories)],
    }));
    return { labels };
  }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { xor4096 } from 'seedrandom';
import { LabelTaskType, ModuleType } from '@/commons/types';
import type { Category, ILabel } from '@/commons/types';

const SEED = '20';
const random = xor4096(SEED);

export default {
  type: ModuleType.DefaultLabeling,
  label: 'Random (Debug)',
  id: 'Random',
  inputs: ['queryUuids', 'categories'],
  outputs: ['labels'],
  blocking: true,
  isBuiltIn: true,
  isServerless: true,
  labelTasks: [LabelTaskType.Classification],
  run: async (
    inputs: {
      queryUuids: string[],
      categories: Category[],
    },
  ): Promise<{ labels: ILabel[] }> => {
    const { queryUuids, categories } = inputs;
    const nCategories = categories.length;
    const labels = queryUuids.map((d) => ({
      uuid: d,
      category: categories[Math.floor(random() * nCategories)],
    }));
    return { labels };
  },
};

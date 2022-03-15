// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LabelTaskType, ModuleType } from '@/commons/types';
import type { ILabel } from '@/commons/types';

export default {
  type: ModuleType.DefaultLabeling,
  label: 'Null (Debug)',
  id: 'Null',
  inputs: ['queryUuids', 'categories'],
  outputs: ['labels'],
  blocking: true,
  isBuiltIn: true,
  isServerless: true,
  labelTasks: [LabelTaskType.Classification],
  run: async (
    inputs: {
      queryUuids: string[],
      unlabeledMark: string,
    },
  ): Promise<{ labels: ILabel[] }> => {
    const { queryUuids, unlabeledMark } = inputs;
    const labels = queryUuids.map((d) => ({
      uuid: d,
      category: unlabeledMark,
    }));
    return { labels };
  },
};

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType, StatusType } from '@/commons/types';
import type { IStatusStorage } from '@/commons/types';

export default {
  type: ModuleType.StoppageAnalysis,
  label: 'All Checked',
  id: 'AllChecked-46322013',
  inputs: ['labels'],
  outputs: ['stop'],
  blocking: true,
  isBuiltIn: true,
  isServerless: true,
  run: async (
    inputs: {
      statuses: IStatusStorage,
      nDataObjects: number,
    },
  ): Promise<{ stop: boolean }> => {
    const { nDataObjects, statuses } = inputs;
    const nLabeled = await statuses.countByValue(StatusType.Labeled);
    const stop = nDataObjects === nLabeled;
    return { stop };
  },
};

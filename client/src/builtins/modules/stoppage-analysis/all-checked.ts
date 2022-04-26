// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType, StatusType } from '@/commons/types';
import type { IStatusStorage } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';

export default class AllChecked extends BaseModule {
  readonly inputs = ['labels'];

  readonly outputs = ['stop'];

  readonly id = 'StoppageAnalysis-AllChecked';

  readonly label = 'AllChecked';

  readonly type = ModuleType.StoppageAnalysis;

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  readonly run = async (
    inputs: {
      statuses: IStatusStorage,
      nDataObjects: number,
    },
  ): Promise<{ stop: boolean }> => {
    const { nDataObjects, statuses } = inputs;
    const nLabeled = await statuses.countByValue(StatusType.Labeled);
    const stop = nDataObjects === nLabeled;
    return { stop };
  }
}

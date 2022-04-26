// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LabelTaskType, ModuleType } from '@/commons/types';
import type { ILabel } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';

export default class Null extends BaseModule {
  readonly inputs = ['queryUuids', 'categories'];

  readonly outputs = ['labels'];

  readonly id = 'DefaultLabeling-Null';

  readonly label = 'Null (Debug)';

  readonly type = ModuleType.DefaultLabeling;

  readonly labelTasks = [LabelTaskType.Classification];

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  readonly run = async (
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
  }
}

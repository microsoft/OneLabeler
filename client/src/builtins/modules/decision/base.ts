// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';

export default class BaseDecisionModule extends BaseModule {
  readonly inputs = ['stop'];

  readonly outputs = [];

  readonly id = 'ConditionalBranching-Base';

  readonly label = 'Base Conditional Branching';

  readonly type = ModuleType.Decision;

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  params = {
    criteria: {
      value: 'stop == true ?',
      label: 'Branching Criteria',
      options: [{
        label: 'stop == true ?',
        value: 'stop == true ?',
      }],
    },
  };

  run = (inputs: { stop: boolean }): boolean => inputs.stop;
}

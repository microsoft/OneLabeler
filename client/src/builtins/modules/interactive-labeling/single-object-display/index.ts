// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';
import TheInterface from './interface/index.vue';

export default class SingleObjectDisplay extends BaseModule {
  readonly inputs = ['dataObjects', 'labels', 'queryUuids'];

  readonly outputs = ['labels'];

  readonly id = 'InteractiveLabeling-SingleObjectDisplay';

  readonly label = 'Single Object Display';

  readonly type = ModuleType.InteractiveLabeling;

  readonly blocking = true;

  readonly persistent = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  readonly render = () => TheInterface;
}

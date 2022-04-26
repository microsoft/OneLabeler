// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';
import TheInterface from './interface/index.vue';

export default class Projection extends BaseModule {
  readonly inputs = ['features', 'labels', 'queryUuids'];

  readonly outputs = ['queryUuids'];

  readonly id = 'DataObjectSelection-Projection';

  readonly label = 'Projection (User Sampling)';

  readonly type = ModuleType.DataObjectSelection;

  readonly blocking = false;

  readonly persistent = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  readonly render = () => TheInterface;
}

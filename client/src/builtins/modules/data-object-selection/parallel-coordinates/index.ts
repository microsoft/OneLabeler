// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';
import TheInterface from './interface/index.vue';

export default class ParallelCoordinates extends BaseModule {
  readonly inputs = ['features', 'labels', 'queryUuids'];

  readonly outputs = ['queryUuids'];

  readonly id = 'DataObjectSelection-ParallelCoordinate';

  readonly label = 'Parallel Coordinate (User Sampling)';

  readonly type = ModuleType.DataObjectSelection;

  readonly blocking = false;

  readonly persistent = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  readonly render = () => TheInterface;
}

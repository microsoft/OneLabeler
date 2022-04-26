// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';
import TheInterface from './interface/index.vue';

export default class GridMatrix extends BaseModule {
  readonly inputs = ['dataObjects', 'labels', 'queryUuids'];

  readonly outputs = ['labels'];

  readonly id = 'InteractiveLabeling-GridMatrix';

  readonly label = 'Grid Matrix';

  readonly type = ModuleType.InteractiveLabeling;

  readonly blocking = true;

  readonly persistent = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  params = {
    nRows: {
      value: 6,
      label: 'Number of Objects per Column',
      options: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 4, label: '4' },
        { value: 6, label: '6' },
        { value: 8, label: '8' },
      ],
    },
    nColumns: {
      value: 8,
      label: 'Number of Objects per Row',
      options: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 4, label: '4' },
        { value: 8, label: '8' },
        { value: 12, label: '12' },
      ],
    },
  };

  readonly render = () => TheInterface;
}

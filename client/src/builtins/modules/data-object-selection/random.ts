// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';

export default {
  type: ModuleType.DataObjectSelection,
  label: 'Random',
  id: 'Random-73417867',
  inputs: ['labels'],
  outputs: ['queryUuids'],
  blocking: true,
  isBuiltIn: true,
  isServerless: true,
  api: 'Random',
  params: {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 4, label: '4' },
        { value: 16, label: '16' },
        { value: 32, label: '32' },
        { value: 48, label: '48' },
        { value: 64, label: '64' },
        { value: 96, label: '96' },
      ],
    },
  },
};

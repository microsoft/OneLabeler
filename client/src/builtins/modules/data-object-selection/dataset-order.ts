// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';

export default {
  type: ModuleType.DataObjectSelection,
  label: 'DatasetOrder',
  id: 'DatasetOrder',
  inputs: ['labels'],
  outputs: ['queryUuids'],
  blocking: true,
  isBuiltIn: true,
  isServerless: true,
  api: 'DatasetOrder',
  // TODO: refactor all computation modules into classes
  // so that their own params can be accessed inside .run()
  params: {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
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

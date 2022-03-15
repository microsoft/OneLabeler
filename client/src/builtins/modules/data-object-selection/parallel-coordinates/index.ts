// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';
import TheInterface from './interface/index.vue';

export default {
  type: ModuleType.DataObjectSelection,
  label: 'Parallel Coordinate (User Sampling)',
  id: 'Parallel Coordinate',
  inputs: ['features', 'labels', 'queryUuids'],
  outputs: ['queryUuids'],
  blocking: false,
  persistent: true,
  isBuiltIn: true,
  isServerless: true,
  render: () => TheInterface,
};

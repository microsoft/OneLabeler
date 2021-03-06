// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';
import TheSingleObjectDisplay from './interface/index.vue';

export default {
  type: ModuleType.InteractiveLabeling,
  label: 'Single Object Display',
  id: 'SingleObjectDisplay-48263667',
  inputs: ['dataObjects', 'labels', 'queryUuids'],
  outputs: ['labels'],
  blocking: true,
  persistent: true,
  isBuiltIn: true,
  isServerless: true,
  render: () => TheSingleObjectDisplay,
};

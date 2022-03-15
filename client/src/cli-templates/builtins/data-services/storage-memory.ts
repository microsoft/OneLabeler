// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StorageType } from '@/commons/types';

export default {
  type: StorageType.ClientMemory,
  label: 'Client-Side Memory',
  api: 'ClientMemory',
  id: 'ClientMemory',
  isBuiltIn: true,
  isServerless: true,
};

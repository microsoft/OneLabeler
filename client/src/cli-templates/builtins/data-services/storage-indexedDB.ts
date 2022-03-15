// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StorageType } from '@/commons/types';

export default {
  type: StorageType.ClientDB,
  label: 'Client-Side Database',
  api: 'ClientDB',
  id: 'ClientDB',
  isBuiltIn: true,
  isServerless: true,
};

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StorageType } from '@/commons/types';
import { DATABASE_URL } from '@/services/http-params';

export default {
  type: StorageType.ServerDB,
  label: 'Server-Side Database',
  api: `${DATABASE_URL}`,
  id: 'ServerDB',
  isBuiltIn: true,
  isServerless: false,
};

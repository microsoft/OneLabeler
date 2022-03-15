// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StorageType } from '@/commons/types';
import type { IStorageStore, StorageService } from '@/commons/types';
import StorageStoreMemory from './storage-memory';
import StorageStoreClientDB from './storage-indexedDB';
import StorageStoreServerDB from './storage-mongoDB';

const createStorage = (service: StorageService): IStorageStore | null => {
  const { type } = service;
  if (type === StorageType.ClientMemory) {
    return new StorageStoreMemory();
  }
  if (type === StorageType.ClientDB) {
    return new StorageStoreClientDB();
  }
  if (type === StorageType.ServerDB) {
    const { api } = service;
    return new StorageStoreServerDB(api);
  }
  return null;
};

export default createStorage;

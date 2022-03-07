import type { SourceService, StorageService } from '@/commons/types';
import sourceDatabase from './source-database';
import sourceFileUpload from './source-file-upload';
import storageDatabase from './storage-database';
import storageIndexedDB from './storage-indexedDB';
import storageMemory from './storage-memory';

export const sourceServices: SourceService[] = [
  sourceFileUpload,
  sourceDatabase,
];

export const storageServices: StorageService[] = [
  storageMemory,
  storageDatabase,
  storageIndexedDB,
];

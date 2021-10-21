import {
  SourceService,
  StorageService,
} from '@/commons/types';
import sourceDatabase from './data-services/source-database';
import sourceFileUpload from './data-services/source-file-upload';
import storageDatabase from './data-services/storage-database';
import storageIndexedDB from './data-services/storage-indexedDB';
import storageMemory from './data-services/storage-memory';

export const sourceServices: SourceService[] = [
  sourceFileUpload,
  sourceDatabase,
];

export const storageServices: StorageService[] = [
  storageMemory,
  storageDatabase,
  storageIndexedDB,
];

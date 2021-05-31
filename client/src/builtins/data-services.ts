import {
  SourceType,
  SourceService,
  StorageType,
  StorageService,
} from '@/commons/types';
import {
  PROTOCOL_DB,
  IP_DB,
  PORT_DB,
} from '@/services/http-params';

export const sourceServices: SourceService[] = [{
  type: SourceType.FileUpload,
  label: 'File Upload',
  api: 'FileUpload',
  id: 'FileUpload',
  isBuiltIn: true,
  isServerless: true,
}, {
  type: SourceType.ServerDB,
  label: 'Server-Side Database',
  api: `${PROTOCOL_DB}://${IP_DB}:${PORT_DB}`,
  id: 'ServerDB',
  isBuiltIn: true,
  isServerless: false,
}];

export const storageServices: StorageService[] = [{
  type: StorageType.ClientMemory,
  label: 'Client-Side Memory',
  api: 'ClientMemory',
  id: 'ClientMemory',
  isBuiltIn: true,
  isServerless: true,
}, {
  type: StorageType.ClientDB,
  label: 'Client-Side Database',
  api: 'ClientDB',
  id: 'ClientDB',
  isBuiltIn: true,
  isServerless: true,
}, {
  type: StorageType.ServerDB,
  label: 'Server-Side Database',
  api: `${PROTOCOL_DB}://${IP_DB}:${PORT_DB}`,
  id: 'ServerDB',
  isBuiltIn: true,
  isServerless: false,
}];

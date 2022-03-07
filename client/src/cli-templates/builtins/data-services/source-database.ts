import { SourceType } from '@/commons/types';
import { DATABASE_URL } from '@/services/http-params';

export default {
  type: SourceType.ServerDB,
  label: 'Server-Side Database',
  api: `${DATABASE_URL}`,
  id: 'ServerDB',
  isBuiltIn: true,
  isServerless: false,
};

import { v4 as uuidv4 } from 'uuid';
import { ModuleType } from '@/commons/types';
import run from './algorithm';

const uuid = uuidv4();

export default {
  type: ModuleType.Base,
  label: `Custom Interface - ${uuid}`,
  id: uuid,
  inputs: [],
  outputs: [],
  isBuiltIn: false,
  isServerless: false,
  run,
};

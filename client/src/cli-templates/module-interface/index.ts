import { v4 as uuidv4 } from 'uuid';
import { ModuleType } from '@/commons/types';
import TheInterface from './interface/index.vue';

const uuid = uuidv4();

export default {
  type: ModuleType.Base,
  label: `Custom Interface - ${uuid}`,
  id: uuid,
  inputs: [],
  outputs: [],
  persistent: true,
  isBuiltIn: false,
  isServerless: true,
  render: () => TheInterface,
};

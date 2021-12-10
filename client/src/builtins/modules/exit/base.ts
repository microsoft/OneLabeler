import { ModuleType } from '@/commons/types';
import type { IModule } from '@/commons/types';

export default {
  type: ModuleType.Exit,
  label: 'Base Exit',
  id: 'BaseExit',
  inputs: [],
  outputs: [],
  isAlgorithmic: true,
  isBuiltIn: true,
  isServerless: true,
} as IModule;

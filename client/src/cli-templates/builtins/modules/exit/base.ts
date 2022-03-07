import { ModuleType } from '@/commons/types';
import type { IModule } from '@/commons/types';

export default {
  type: ModuleType.Exit,
  label: 'Base Exit',
  id: 'BaseExit',
  inputs: ['labels'],
  outputs: [],
  blocking: true,
  isBuiltIn: true,
  isServerless: true,
} as IModule;

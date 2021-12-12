import { ModuleType } from '@/commons/types';
import type { ModelService } from '@/commons/types';

export default {
  type: ModuleType.ModelTraining,
  label: 'Static',
  id: 'Static-72885436',
  inputs: ['model'],
  outputs: ['model'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isServerless: true,
  run: (inputs: { model: ModelService }) => inputs.model,
};

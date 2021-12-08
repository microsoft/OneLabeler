import {
  ModuleType,
} from '@/commons/types';

export default {
  type: ModuleType.ModelTraining,
  label: 'Static',
  id: 'Static-72885436',
  inputs: ['model'],
  outputs: ['model'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'Static',
};

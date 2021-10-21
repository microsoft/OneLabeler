import {
  ProcessType,
} from '@/commons/types';

export default {
  type: ProcessType.ModelTraining,
  label: 'Static',
  id: 'Static-72885436',
  inputs: ['model'],
  output: 'model',
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'Static',
};

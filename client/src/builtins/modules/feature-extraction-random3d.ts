import {
  ProcessType,
} from '@/commons/types';

export default {
  type: ProcessType.FeatureExtraction,
  label: 'Random3D (Dummy)',
  id: 'Random-87333124',
  inputs: ['dataObjects'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'Random3D',
};

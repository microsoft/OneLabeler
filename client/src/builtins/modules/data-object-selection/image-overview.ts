import { ProcessType } from '@/commons/types';

export default {
  type: ProcessType.DataObjectSelection,
  label: 'Overview (User Sampling)',
  id: 'ImageOverview',
  inputs: ['dataObjects', 'labels'],
  outputs: ['samples'],
  isAlgorithmic: false,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'ImageOverview',
};

import { ProcessType } from '@/commons/types';

export default {
  type: ProcessType.DataObjectSelection,
  label: 'Projection (User Sampling)',
  id: 'Projection',
  inputs: ['features', 'labels', 'queryUuids'],
  outputs: ['queryUuids'],
  isAlgorithmic: false,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'Projection',
};

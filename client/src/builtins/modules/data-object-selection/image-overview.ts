import { ModuleType } from '@/commons/types';

export default {
  type: ModuleType.DataObjectSelection,
  label: 'Overview (User Sampling)',
  id: 'ImageOverview',
  inputs: ['dataObjects', 'labels'],
  outputs: ['queryUuids'],
  isAlgorithmic: false,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'ImageOverview',
};

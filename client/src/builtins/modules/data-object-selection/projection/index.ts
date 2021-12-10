import { ModuleType } from '@/commons/types';
import TheProjection from './interface/index.vue';

export default {
  type: ModuleType.DataObjectSelection,
  label: 'Projection (User Sampling)',
  id: 'Projection',
  inputs: ['features', 'labels', 'queryUuids'],
  outputs: ['queryUuids'],
  isAlgorithmic: false,
  isBuiltIn: true,
  isServerless: true,
  render: () => TheProjection,
};

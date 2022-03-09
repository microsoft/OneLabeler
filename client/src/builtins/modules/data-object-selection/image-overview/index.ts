import { ModuleType } from '@/commons/types';
import TheImageOverview from './interface/index.vue';

export default {
  type: ModuleType.DataObjectSelection,
  label: 'Overview (User Sampling)',
  id: 'ImageOverview',
  inputs: ['dataObjects', 'labels', 'queryUuids'],
  outputs: ['queryUuids'],
  blocking: false,
  persistent: true,
  isBuiltIn: true,
  isServerless: true,
  render: () => TheImageOverview,
};

import { ModuleType } from '@/commons/types';
import TheSingleObjectDisplay from './interface/index.vue';

export default {
  type: ModuleType.InteractiveLabeling,
  label: 'Single Object Display',
  id: 'SingleObjectDisplay-48263667',
  inputs: ['dataObjects', 'labels', 'queryUuids'],
  outputs: ['labels'],
  isAlgorithmic: false,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  render: () => TheSingleObjectDisplay,
};

import { ProcessType } from '@/commons/types';

export default {
  type: ProcessType.InteractiveLabeling,
  label: 'Single Object Display',
  id: 'SingleObjectDisplay-48263667',
  inputs: ['dataObjects', 'samples'],
  outputs: ['labels'],
  isAlgorithmic: false,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'SingleObjectDisplay',
};

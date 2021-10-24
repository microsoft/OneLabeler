import { ProcessType } from '@/commons/types';

export default {
  type: ProcessType.StoppageAnalysis,
  label: 'AllChecked',
  id: 'AllChecked-46322013',
  inputs: ['labels'],
  outputs: ['stop'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'AllChecked',
};

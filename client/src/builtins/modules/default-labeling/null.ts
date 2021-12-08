import {
  LabelTaskType,
  ModuleType,
} from '@/commons/types';

export default {
  type: ModuleType.DefaultLabeling,
  label: 'Null (Dummy)',
  id: 'Null-35514905',
  inputs: ['queryUuids'],
  outputs: ['labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'Null',
  labelTasks: [LabelTaskType.Classification],
};

import {
  LabelTaskType,
  ModuleType,
} from '@/commons/types';

export default {
  type: ModuleType.DefaultLabeling,
  label: 'Random (Dummy)',
  id: 'Random-38398168',
  inputs: ['queryUuids', 'categories'],
  outputs: ['labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'Random',
  labelTasks: [LabelTaskType.Classification],
};

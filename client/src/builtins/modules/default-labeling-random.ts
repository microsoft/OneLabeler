import {
  LabelTaskType,
  ProcessType,
} from '@/commons/types';

export default {
  type: ProcessType.DefaultLabeling,
  label: 'Random (Dummy)',
  id: 'Random-38398168',
  inputs: ['features'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'Random',
  labelTasks: [LabelTaskType.Classification],
};

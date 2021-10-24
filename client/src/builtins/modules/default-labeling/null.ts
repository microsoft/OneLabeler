import {
  LabelTaskType,
  ProcessType,
} from '@/commons/types';

export default {
  type: ProcessType.DefaultLabeling,
  label: 'Null (Dummy)',
  id: 'Null-35514905',
  inputs: ['features'],
  outputs: ['labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'Null',
  labelTasks: [LabelTaskType.Classification],
};

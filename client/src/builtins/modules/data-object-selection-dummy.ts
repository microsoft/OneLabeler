import {
  ProcessType,
} from '@/commons/types';

export default {
  type: ProcessType.DataObjectSelection,
  label: 'DatasetOrder (Dummy)',
  id: 'DatasetOrder',
  inputs: ['labels'],
  output: 'samples',
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'DatasetOrder',
  params: {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
        { value: 4, label: '4' },
        { value: 16, label: '16' },
        { value: 32, label: '32' },
        { value: 48, label: '48' },
        { value: 64, label: '64' },
        { value: 96, label: '96' },
      ],
    },
  },
};

import { ProcessType } from '@/commons/types';

export default {
  type: ProcessType.InteractiveLabeling,
  label: 'Grid Matrix',
  id: 'GridMatrix-89670576',
  inputs: ['dataObjects', 'samples'],
  outputs: ['labels'],
  isAlgorithmic: false,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'GridMatrix',
  params: {
    nRows: {
      value: 6,
      label: 'Number of Objects per Column',
      options: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 4, label: '4' },
        { value: 6, label: '6' },
        { value: 8, label: '8' },
      ],
    },
    nColumns: {
      value: 8,
      label: 'Number of Objects per Row',
      options: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 4, label: '4' },
        { value: 8, label: '8' },
        { value: 12, label: '12' },
      ],
    },
  },
};

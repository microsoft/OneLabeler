import { ProcessType } from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';

export default {
  type: ProcessType.DataObjectSelection,
  label: 'Cluster (Clustering)',
  id: 'Cluster-13466955',
  inputs: ['features', 'labels'],
  output: 'samples',
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  // 'http://localhost:8005/selection/Cluster',
  api: `${ALGORITHM_URL}/selection/Cluster`,
  params: {
    nBatch: {
      value: 16,
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

import {
  ProcessType,
} from '@/commons/types';
import {
  PROTOCOL_ALGO,
  IP_ALGO,
  PORT_ALGO,
} from '@/services/http-params';

export default {
  type: ProcessType.DataObjectSelection,
  label: 'EntropyDiversityDensity (Active Learning)',
  id: 'EntropyDiversityDensity-60957928',
  inputs: ['features', 'labels', 'model'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: true,
  isServerless: false,
  // 'http://localhost:8005/selection/EntropyDiversityDensity'
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/selection/EntropyDiversityDensity`,
  model: undefined,
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

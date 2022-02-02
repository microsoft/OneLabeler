import { ModuleType } from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';

export default {
  type: ModuleType.DataObjectSelection,
  label: 'SmallestMargin (Active Learning)',
  id: 'SmallestMargin-74021796',
  inputs: ['features', 'labels', 'model'],
  outputs: ['queryUuids'],
  blocking: true,
  isBuiltIn: true,
  isServerless: false,
  api: `${ALGORITHM_URL}/selection/SmallestMargin`,
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

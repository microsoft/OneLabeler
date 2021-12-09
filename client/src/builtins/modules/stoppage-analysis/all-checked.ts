import { ModuleType, StatusType } from '@/commons/types';
import type { IStatusStorage } from '@/commons/types';

export default {
  type: ModuleType.StoppageAnalysis,
  label: 'AllChecked',
  id: 'AllChecked-46322013',
  inputs: ['labels'],
  outputs: ['stop'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'AllChecked',
  run: async (
    inputs: {
      statuses: IStatusStorage,
      nDataObjects: number,
    },
  ): Promise<{ stop: boolean }> => {
    const { nDataObjects, statuses } = inputs;
    const nLabeled = await statuses.count({ value: StatusType.Labeled });
    const stop = nDataObjects === nLabeled;
    return { stop };
  },
};

import { ModuleType } from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';

export default {
  type: ModuleType.DefaultLabeling,
  label: 'ModelPrediction',
  id: 'ModelPrediction-29967546',
  inputs: ['features', 'model', 'queryUuids'],
  outputs: ['labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isServerless: false,
  model: undefined,
  api: `${ALGORITHM_URL}/defaultLabels/ModelPrediction`,
};

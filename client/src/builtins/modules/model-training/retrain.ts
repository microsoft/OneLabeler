import { ModuleType } from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';

export default {
  type: ModuleType.ModelTraining,
  label: 'Retrain',
  id: 'Retrain-16440841',
  inputs: ['features', 'labels', 'model'],
  outputs: ['model'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isServerless: false,
  api: `${ALGORITHM_URL}/modelUpdated/Retrain`,
};

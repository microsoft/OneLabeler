import {
  ProcessType,
} from '@/commons/types';
import {
  PROTOCOL_ALGO,
  IP_ALGO,
  PORT_ALGO,
} from '@/services/http-params';

export default {
  type: ProcessType.ModelTraining,
  label: 'Retrain',
  id: 'Retrain-16440841',
  inputs: ['features', 'labels', 'model'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  // 'http://localhost:8005/modelUpdated/Retrain'
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/modelUpdated/Retrain`,
};

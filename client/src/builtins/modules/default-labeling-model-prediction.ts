import {
  ProcessType,
} from '@/commons/types';
import {
  PROTOCOL_ALGO,
  IP_ALGO,
  PORT_ALGO,
} from '@/services/http-params';

export default {
  type: ProcessType.DefaultLabeling,
  label: 'ModelPrediction',
  id: 'ModelPrediction-29967546',
  inputs: ['features', 'model'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: true,
  isServerless: false,
  model: undefined,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/defaultLabels/ModelPrediction`,
};

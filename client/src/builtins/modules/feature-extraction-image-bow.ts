import {
  DataType,
  ProcessType,
} from '@/commons/types';
import {
  PROTOCOL_ALGO,
  IP_ALGO,
  PORT_ALGO,
} from '@/services/http-params';

export default {
  type: ProcessType.FeatureExtraction,
  label: 'BoW (Handcrafted)',
  id: 'image-BoW-6989392',
  inputs: ['dataObjects'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/features/image/BoW`,
  dataTypes: [DataType.Image],
};

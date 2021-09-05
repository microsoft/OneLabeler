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
  label: 'SVD (Unsupervised)',
  id: 'image-SVD-25940167',
  inputs: ['dataObjects'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  // api: 'http://localhost:8005/features/image/SVD',
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/features/image/SVD`,
  dataTypes: [DataType.Image],
}

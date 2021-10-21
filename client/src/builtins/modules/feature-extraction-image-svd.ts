import {
  DataType,
  ProcessType,
} from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';

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
  api: `${ALGORITHM_URL}/features/image/SVD`,
  dataTypes: [DataType.Image],
};

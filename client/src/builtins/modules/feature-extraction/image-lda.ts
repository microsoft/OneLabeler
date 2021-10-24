import {
  DataType,
  ProcessType,
} from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';

export default {
  type: ProcessType.FeatureExtraction,
  label: 'LDA (Supervised)',
  id: 'image-LDA-45100847',
  inputs: ['dataObjects', 'labels'],
  outputs: ['features'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  api: `${ALGORITHM_URL}/features/image/LDA`,
  dataTypes: [DataType.Image],
};

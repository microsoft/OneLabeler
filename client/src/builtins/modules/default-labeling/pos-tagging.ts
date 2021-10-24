import {
  DataType,
  LabelTaskType,
  ProcessType,
} from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';

export default {
  type: ProcessType.DefaultLabeling,
  label: 'POS-tagging',
  id: 'POS-tagging-438546',
  inputs: ['dataObjects', 'features'],
  outputs: ['labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  api: `${ALGORITHM_URL}/defaultLabels/POS-tagging`,
  dataTypes: [DataType.Text],
  labelTasks: [LabelTaskType.SpanClassification],
};

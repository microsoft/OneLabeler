import {
  DataType,
  LabelTaskType,
  ModuleType,
} from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';

export default {
  type: ModuleType.DefaultLabeling,
  label: 'POS-tagging',
  id: 'POS-tagging-438546',
  inputs: ['dataObjects', 'queryUuids'],
  outputs: ['labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  api: `${ALGORITHM_URL}/defaultLabels/POS-tagging`,
  dataTypes: [DataType.Text],
  labelTasks: [LabelTaskType.SpanClassification],
};

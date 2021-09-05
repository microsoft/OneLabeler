import {
  DataType,
  LabelTaskType,
  ProcessType,
} from '@/commons/types';
import {
  PROTOCOL_ALGO,
  IP_ALGO,
  PORT_ALGO,
} from '@/services/http-params';

export default {
  type: ProcessType.DefaultLabeling,
  label: 'POS-tagging',
  id: 'POS-tagging-438546',
  inputs: ['dataObjects', 'features'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/defaultLabels/POS-tagging`,
  dataTypes: [DataType.Text],
  labelTasks: [LabelTaskType.SpanClassification],
};

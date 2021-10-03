import {
  LabelTaskType,
  ILabelTaskTypeSetup,
} from '@/commons/types';
import VSingleTool from './VSingleTool.vue';

export default {
  type: LabelTaskType.MultiLabelClassification,
  label: 'multi-label classification',
  singleTool: VSingleTool,
} as ILabelTaskTypeSetup;

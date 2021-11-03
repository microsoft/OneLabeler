import {
  LabelTaskType,
  ILabelTaskTypeSetup,
} from '@/commons/types';
import BaseSingleTool from './BaseSingleTool.vue';

export default {
  type: LabelTaskType.MultiLabelClassification,
  label: 'multi-label classification',
  singleTool: BaseSingleTool,
} as ILabelTaskTypeSetup;

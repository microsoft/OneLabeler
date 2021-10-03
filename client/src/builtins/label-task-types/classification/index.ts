import { LabelTaskType, ILabelTaskTypeSetup } from '@/commons/types';
import VSingleTool from './VSingleTool.vue';
import VBatchTool from './VBatchTool.vue';

export default {
  type: LabelTaskType.Classification,
  label: 'classification',
  singleTool: VSingleTool,
  batchTool: VBatchTool,
} as ILabelTaskTypeSetup;

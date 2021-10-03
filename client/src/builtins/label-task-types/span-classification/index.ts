import { LabelTaskType, ILabelTaskTypeSetup } from '@/commons/types';
import VSingleTool from './VSingleTool.vue';
import VPanel from './VPanel.vue';

export default {
  type: LabelTaskType.SpanClassification,
  label: 'span tagging',
  singleTool: VSingleTool,
  panel: VPanel,
} as ILabelTaskTypeSetup;

import { LabelTaskType, ILabelTaskTypeSetup } from '@/commons/types';
import VSingleTool from './VSingleTool.vue';

export default {
  type: LabelTaskType.Segmentation,
  label: 'segmentation',
  singleTool: VSingleTool,
} as ILabelTaskTypeSetup;

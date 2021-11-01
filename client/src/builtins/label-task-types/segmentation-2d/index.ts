import { LabelTaskType, ILabelTaskTypeSetup } from '@/commons/types';
import VSingleTool from './VSingleTool.vue';

export default {
  type: LabelTaskType.Segmentation2d,
  label: '2d segmentation',
  singleTool: VSingleTool,
} as ILabelTaskTypeSetup;
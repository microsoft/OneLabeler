import { LabelTaskType, ILabelTaskTypeSetup } from '@/commons/types';
import BaseSingleTool from './BaseSingleTool.vue';

export default {
  type: LabelTaskType.Segmentation2d,
  label: '2d segmentation',
  singleTool: BaseSingleTool,
} as ILabelTaskTypeSetup;

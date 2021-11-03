import { LabelTaskType, ILabelTaskTypeSetup } from '@/commons/types';
import BaseSingleTool from './BaseSingleTool.vue';

export default {
  type: LabelTaskType.ObjectDetection,
  label: 'object detection',
  singleTool: BaseSingleTool,
} as ILabelTaskTypeSetup;

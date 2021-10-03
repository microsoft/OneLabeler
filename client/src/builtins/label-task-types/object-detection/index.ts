import { LabelTaskType, ILabelTaskTypeSetup } from '@/commons/types';
import VSingleTool from './VSingleTool.vue';

export default {
  type: LabelTaskType.ObjectDetection,
  label: 'object detection',
  singleTool: VSingleTool,
} as ILabelTaskTypeSetup;

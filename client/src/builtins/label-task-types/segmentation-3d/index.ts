import { LabelTaskType, ILabelTaskTypeSetup } from '@/commons/types';
import VSingleTool from './VSingleTool.vue';
import VOverlay from './VOverlay.vue';

export default {
  type: LabelTaskType.Segmentation3d,
  label: '3d segmentation',
  singleTool: VSingleTool,
  overlay: VOverlay,
} as ILabelTaskTypeSetup;

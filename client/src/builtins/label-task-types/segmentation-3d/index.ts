import { LabelTaskType } from '@/commons/types';
import type { ILabelTaskTypeSetup } from '@/commons/types';
import BaseSingleTool from './BaseSingleTool.vue';
import BaseOverlay from './BaseOverlay.vue';

export default {
  type: LabelTaskType.Segmentation3d,
  label: '3d segmentation',
  singleTool: BaseSingleTool,
  overlay: BaseOverlay,
} as ILabelTaskTypeSetup;

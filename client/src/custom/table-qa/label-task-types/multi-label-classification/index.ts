import type { ILabelTaskTypeSetup } from '@/commons/types';
import BaseSingleTool from './BaseSingleTool.vue';

export default {
  type: 'CustomMultiLabelClassification',
  label: 'custom multi-label classification',
  singleTool: BaseSingleTool,
} as ILabelTaskTypeSetup;

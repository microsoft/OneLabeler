import { ILabelTaskTypeSetup } from '@/commons/types';
import VSingleTool from './VSingleTool.vue';

export default {
  type: 'CustomMultiLabelClassification',
  label: 'custom multi-label classification',
  singleTool: VSingleTool,
} as ILabelTaskTypeSetup;

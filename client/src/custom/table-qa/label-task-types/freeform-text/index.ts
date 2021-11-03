import { ILabelTaskTypeSetup } from '@/commons/types';
import BaseSingleTool from './BaseSingleTool.vue';
import BasePanel from './BasePanel.vue';

export default {
  type: 'CustomFreeformText',
  label: 'custom freeform text',
  singleTool: BaseSingleTool,
  panel: BasePanel,
} as ILabelTaskTypeSetup;

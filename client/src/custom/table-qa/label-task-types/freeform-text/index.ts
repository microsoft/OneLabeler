import { ILabelTaskTypeSetup } from '@/commons/types';
import VSingleTool from './VSingleTool.vue';
import VPanel from './VPanel.vue';

export default {
  type: 'CustomFreeformText',
  label: 'custom freeform text',
  singleTool: VSingleTool,
  panel: VPanel,
} as ILabelTaskTypeSetup;

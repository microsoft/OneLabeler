import { LabelTaskType, ILabelTaskTypeSetup } from '@/commons/types';
import BasePanel from './BasePanel.vue';

export default {
  type: LabelTaskType.AnnotationRelation,
  label: 'span relation',
  panel: BasePanel,
} as ILabelTaskTypeSetup;

import { LabelTaskType, ILabelTaskTypeSetup } from '@/commons/types';
import VPanel from './VPanel.vue';

export default {
  type: LabelTaskType.AnnotationRelation,
  label: 'span relation',
  panel: VPanel,
} as ILabelTaskTypeSetup;

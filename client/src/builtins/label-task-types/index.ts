import type { ILabelTaskTypeSetup } from '@/commons/types';
import customClassification from '@/custom/table-qa/label-task-types/multi-label-classification';
import customFreeformText from '@/custom/table-qa/label-task-types/freeform-text';
import classification from './classification';
import freeformText from './freeform-text';
import multiLabelClassification from './multi-label-classification';
import objectDetection from './object-detection';
import relation from './relation';
import segmentation2d from './segmentation-2d';
import segmentation3d from './segmentation-3d';
import spanClassification from './span-classification';

export default [
  classification,
  multiLabelClassification,
  freeformText,
  objectDetection,
  segmentation2d,
  segmentation3d,
  spanClassification,
  relation,
  customClassification,
  customFreeformText,
] as ILabelTaskTypeSetup[];

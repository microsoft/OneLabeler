import { ILabelTaskTypeSetup } from '@/commons/types';
import classification from './classification';
import freeformText from './freeform-text';
import multiLabelClassification from './multi-label-classification';
import objectDetection from './object-detection';
import relation from './relation';
import segmentation2d from './segmentation-2d';
import spanClassification from './span-classification';
import customClassification from './custom-multi-label-classification';

export default [
  classification,
  multiLabelClassification,
  freeformText,
  objectDetection,
  segmentation2d,
  spanClassification,
  relation,
  customClassification,
] as ILabelTaskTypeSetup[];

import { ILabelTaskTypeSetup } from '@/commons/types';
import classification from './classification';
import freeformText from './freeform-text';
import multiLabelClassification from './multi-label-classification';
import objectDetection from './object-detection';
import relation from './relation';
import segmentation from './segmentation';
import spanClassification from './span-classification';
import customClassification from './custom-multi-label-classification';

export default [
  classification,
  multiLabelClassification,
  freeformText,
  objectDetection,
  segmentation,
  spanClassification,
  relation,
  customClassification,
] as ILabelTaskTypeSetup[];

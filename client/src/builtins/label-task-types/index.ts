import { ILabelTaskTypeSetup } from '@/commons/types';
import classification from './classification';
import freeformText from './freeform-text';
import multiLabelClassification from './multi-label-classification';
import objectDetection from './object-detection';
import relation from './relation';
import segmentation from './segmentation';
import spanClassification from './span-classification';

export default [
  classification,
  multiLabelClassification,
  freeformText,
  objectDetection,
  segmentation,
  spanClassification,
  relation,
] as ILabelTaskTypeSetup[];

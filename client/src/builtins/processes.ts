import {
  Process,
} from '@/commons/types';
// data object selection modules
import DOSCluster from '@/builtins/modules/data-object-selection-cluster';
import DOSClusterCentroids from '@/builtins/modules/data-object-selection-cluster-centroids';
import DOSDenseAreas from '@/builtins/modules/data-object-selection-dense-areas';
import DOSDummy from '@/builtins/modules/data-object-selection-dummy';
import DOSEntropy from '@/builtins/modules/data-object-selection-entropy';
import DOSEntropyDiversity from '@/builtins/modules/data-object-selection-entropy-diversity';
import DOSEntropyDiversityDensity from '@/builtins/modules/data-object-selection-entropy-diversity-density';
import DOSImageOverview from '@/builtins/modules/data-object-selection-image-overview';
import DOSLeastConfident from '@/builtins/modules/data-object-selection-least-confident';
import DOSProjection from '@/builtins/modules/data-object-selection-projection';
import DOSRandom from '@/builtins/modules/data-object-selection-random';
import DOSSmallestMargin from '@/builtins/modules/data-object-selection-smallest-margin';
// default labeling modules
import DLModelPrediction from '@/builtins/modules/default-labeling-model-prediction';
import DLNull from '@/builtins/modules/default-labeling-null';
import DLPosTagging from '@/builtins/modules/default-labeling-pos-tagging';
import DLRandom from '@/builtins/modules/default-labeling-random';
// feature extraction modules
import FEImageBow from '@/builtins/modules/feature-extraction-image-bow';
import FEImageLda from '@/builtins/modules/feature-extraction-image-lda';
import FEImageSvd from '@/builtins/modules/feature-extraction-image-svd';
import FERandom3d from '@/builtins/modules/feature-extraction-random3d';
import FETextNmf from '@/builtins/modules/feature-extraction-text-nmf';
// interactive labeling modules
import ILGridMatrix from '@/builtins/modules/interactive-labeling-grid-matrix';
import ILSingleObjectDisplay from '@/builtins/modules/interactive-labeling-single-object-display';
// model training modules
import MTRetrain from '@/builtins/modules/model-training-retrain';
import MTStatic from '@/builtins/modules/model-training-static';
// stoppage analysis modules
import SAAllChecked from '@/builtins/modules/stoppage-analysis-all-checked';

/**
 * TODO: [refactor] may store the valid processes at the data type declarations
 * so that given a customized data type, the existing processes can still be reused.
 */

const processes: Process[] = [
  // data object selection modules:
  DOSCluster,
  DOSClusterCentroids,
  DOSDenseAreas,
  DOSDummy,
  DOSEntropy,
  DOSEntropyDiversity,
  DOSEntropyDiversityDensity,
  DOSImageOverview,
  DOSLeastConfident,
  DOSProjection,
  DOSRandom,
  DOSSmallestMargin,
  // default labeling modules:
  DLModelPrediction,
  DLPosTagging,
  DLNull,
  DLRandom,
  // feature extraction modules:
  FEImageSvd,
  FEImageBow,
  FEImageLda,
  FERandom3d,
  FETextNmf,
  // interactive labeling modules:
  ILGridMatrix,
  ILSingleObjectDisplay,
  // model training modules:
  MTRetrain,
  MTStatic,
  // stoppage analysis modules:
  SAAllChecked,
];

export default processes;

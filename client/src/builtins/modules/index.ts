import { Process } from '@/commons/types';
// custom modules
import CustomExport from '@/custom/table-qa/modules/custom/export';
import CustomLoad from '@/custom/table-qa/modules/custom/load';
// data object selection modules
import DOSCluster from './data-object-selection/cluster';
import DOSClusterCentroids from './data-object-selection/cluster-centroids';
import DOSDenseAreas from './data-object-selection/dense-areas';
import DOSDummy from './data-object-selection/dummy';
import DOSEntropy from './data-object-selection/entropy';
import DOSEntropyDiversity from './data-object-selection/entropy-diversity';
import DOSEntropyDiversityDensity from './data-object-selection/entropy-diversity-density';
import DOSImageOverview from './data-object-selection/image-overview';
import DOSLeastConfident from './data-object-selection/least-confident';
import DOSProjection from './data-object-selection/projection';
import DOSRandom from './data-object-selection/random';
import DOSSmallestMargin from './data-object-selection/smallest-margin';
// default labeling modules
import DLModelPrediction from './default-labeling/model-prediction';
import DLNull from './default-labeling/null';
import DLPointnetSegmentation from './default-labeling/pointnet-segmentation';
import DLPosTagging from './default-labeling/pos-tagging';
import DLRandom from './default-labeling/random';
// feature extraction modules
import FEImageBow from './feature-extraction/image-bow';
import FEImageLda from './feature-extraction/image-lda';
import FEImageSvd from './feature-extraction/image-svd';
import FERandom3d from './feature-extraction/random3d';
import FETextNmf from './feature-extraction/text-nmf';
// interactive labeling modules
import ILGridMatrix from './interactive-labeling/grid-matrix';
import ILSingleObjectDisplay from './interactive-labeling/single-object-display';
// model training modules
import MTRetrain from './model-training/retrain';
import MTStatic from './model-training/static';
// stoppage analysis modules
import SAAllChecked from './stoppage-analysis/all-checked';

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
  DLPointnetSegmentation,
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
  // custom modules:
  CustomExport,
  CustomLoad,
];

export default processes;

// data object selection modules
import Cluster from './cluster';
import ClusterCentroids from './cluster-centroids';
import DenseAreas from './dense-areas';
import DatasetOrder from './dataset-order';
import Entropy from './entropy';
import EntropyDiversity from './entropy-diversity';
import EntropyDiversityDensity from './entropy-diversity-density';
import ImageOverview from './image-overview';
import LeastConfident from './least-confident';
import Projection from './projection';
import Random from './random';
import SmallestMargin from './smallest-margin';

export default [
  Cluster,
  ClusterCentroids,
  DenseAreas,
  DatasetOrder,
  Entropy,
  EntropyDiversity,
  EntropyDiversityDensity,
  ImageOverview,
  LeastConfident,
  Projection,
  Random,
  SmallestMargin,
];

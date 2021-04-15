import {
  DefaultLabelingMethodType,
  LabelTaskType,
  SamplingStrategyType,
  TaskTransformationType,
  StoppageAnalysisType,
  InterimModelTrainingType,
  FeatureExtractionMethod,
} from '@/commons/types';
import {
  PROTOCOL,
  IP,
  SERVER_PORT,
} from '@/services/http-params';

export interface IState {
  /** The collection of feature extraction methods. */
  featureExtractionMethods: FeatureExtractionMethod[],
  featureExtractionMethod: FeatureExtractionMethod,
  /** The data sampling strategy. */
  samplingStrategy: SamplingStrategyType,
  /** The number of data objects to sample each time. */
  nBatch: number,
  /** The default labeling model. */
  defaultLabelingMethod: DefaultLabelingMethodType,
  /** Whether to show the dataset overview. */
  showDatasetOverview: boolean,
  /** The task the labeler is instructed to carry out. */
  taskTransformation: TaskTransformationType,
  /** Whether to show single object display. */
  singleObjectDisplayEnabled: boolean,
  /** Whether to show grid matrix. */
  gridMatrixEnabled: boolean,
  /** The number of data objects per row in the thumbnail matrix. */
  itemsPerRow: number,
  /** The number of data objects per column in the thumbnail matrix. */
  itemsPerCol: number,
  /** The stoppage analysis method. */
  stoppageAnalysis: StoppageAnalysisType,
  /** Whether to enable interim model training. */
  interimModelTrainingEnabled: boolean,
  /** The interim model training method. */
  interimModelTraining: InterimModelTrainingType,
  /** The concerned data labeling tasks. */
  labelTasks: LabelTaskType[],
}

const featureExtractionMethods = [{
  name: 'SVD (Unsupervised)',
  serverless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/extractFeatures/image/SVD`,
  parameters: ['dataObjects'],
  isBuiltIn: true,
  id: 'image-SVD-25940167',
}, {
  name: 'BoW (Handcrafted)',
  serverless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/extractFeatures/image/BoW`,
  parameters: ['dataObjects'],
  isBuiltIn: true,
  id: 'image-BoW-6989392',
}, {
  name: 'LDA (Supervised)',
  serverless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/extractFeatures/image/LDA`,
  parameters: ['dataObjects', 'labels'],
  isBuiltIn: true,
  id: 'image-LDA-45100847',
}, {
  name: 'Random3D (Dummy)',
  serverless: true,
  api: 'Random3D',
  parameters: ['dataObjects'],
  isBuiltIn: true,
  id: 'random-87333124',
}];

export const createInitialState = (): IState => ({
  featureExtractionMethods,
  featureExtractionMethod: {
    name: 'SVD (Unsupervised)',
    serverless: false,
    api: `${PROTOCOL}://${IP}:${SERVER_PORT}/extractFeatures/image/SVD`,
    parameters: ['dataObjects'],
    isBuiltIn: true,
    id: 'image-SVD-25940167',
  },
  samplingStrategy: SamplingStrategyType.Random,
  nBatch: 1,
  defaultLabelingMethod: DefaultLabelingMethodType.Null,
  showDatasetOverview: false,
  taskTransformation: TaskTransformationType.DirectLabeling,
  singleObjectDisplayEnabled: false,
  gridMatrixEnabled: false,
  itemsPerRow: 8,
  itemsPerCol: 6,
  stoppageAnalysis: StoppageAnalysisType.AllChecked,
  interimModelTrainingEnabled: false,
  interimModelTraining: InterimModelTrainingType.Retrain,
  labelTasks: [], // [LabelTaskType.Classification],
});

export default createInitialState();

import {
  DataType,
  LabelTaskType,
  SamplingStrategyType,
  TaskTransformationType,
  StoppageAnalysisType,
  ModelService,
  FeatureExtractionMethod,
  DefaultLabelingMethod,
  InterimModelTrainingMethod,
  InteractiveLabelingMethod,
} from '@/commons/types';
import {
  modelServices,
  featureExtractionMethods,
  defaultLabelingMethods,
  interimModelTrainingMethods,
  interactiveLabelingMethods,
} from '@/commons/builtins';

export interface IState {
  /** The concerned data object type. */
  dataType: DataType,
  /** The concerned data labeling tasks. */
  labelTasks: LabelTaskType[],
  /** The collection of model services. */
  modelServices: ModelService[],
  /** The collection of feature extraction methods. */
  featureExtractionMethods: FeatureExtractionMethod[],
  featureExtractionMethod: FeatureExtractionMethod,
  /** The collection of default labeling methods. */
  defaultLabelingMethods: DefaultLabelingMethod[],
  /** The default labeling model. */
  defaultLabelingMethod: DefaultLabelingMethod,
  defaultLabelingModel: ModelService | null,
  /** The collection of interim model training methods. */
  interimModelTrainingMethods: InterimModelTrainingMethod[],
  /** The interim model training method. */
  interimModelTrainingMethod: InterimModelTrainingMethod,
  /** The collection of interactive labeling methods. */
  interactiveLabelingMethods: InteractiveLabelingMethod[],
  interactiveLabelingMethod: InteractiveLabelingMethod[],
  /** Whether to show single object display. */
  singleObjectDisplayEnabled: boolean,
  /** Whether to show grid matrix. */
  gridMatrixEnabled: boolean,
  /** The data sampling strategy. */
  samplingStrategy: SamplingStrategyType,
  /** The number of data objects to sample each time. */
  nBatch: number,
  /** Whether to show the dataset overview. */
  showDatasetOverview: boolean,
  /** The task the labeler is instructed to carry out. */
  taskTransformation: TaskTransformationType,
  /** The stoppage analysis method. */
  stoppageAnalysis: StoppageAnalysisType,
}

export const createInitialState = (): IState => ({
  dataType: DataType.Image,
  labelTasks: [], // [LabelTaskType.Classification],
  modelServices,
  featureExtractionMethods,
  featureExtractionMethod: featureExtractionMethods
    .find((d) => d.name === 'SVD (Unsupervised)') as FeatureExtractionMethod,
  defaultLabelingMethods,
  defaultLabelingMethod: defaultLabelingMethods
    .find((d) => d.name === 'Null (Dummy)') as DefaultLabelingMethod,
  defaultLabelingModel: null,
  interimModelTrainingMethods,
  interimModelTrainingMethod: interimModelTrainingMethods
    .find((d) => d.name === 'Static') as InterimModelTrainingMethod,
  interactiveLabelingMethods,
  interactiveLabelingMethod: [] as InteractiveLabelingMethod[],
  samplingStrategy: SamplingStrategyType.Random,
  nBatch: 1,
  showDatasetOverview: false,
  taskTransformation: TaskTransformationType.DirectLabeling,
  singleObjectDisplayEnabled: false,
  gridMatrixEnabled: false,
  stoppageAnalysis: StoppageAnalysisType.AllChecked,
});

export default createInitialState();

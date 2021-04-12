import {
  DefaultLabelingMethodType,
  FeatureExtractionMethodType,
  LabelTaskType,
  SamplingStrategyType,
  TaskTransformationType,
  StoppageAnalysisType,
  InterimModelTrainingType,
} from '@/commons/types';
import { trickle } from 'nprogress';

export interface IState {
  /** The data labeling workflow configuration parameters. */
  featureExtractionMethod: FeatureExtractionMethodType,
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

export const createInitialState = (): IState => ({
  featureExtractionMethod: FeatureExtractionMethodType.Unsupervised,
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
  labelTasks: [LabelTaskType.ImageClassification],
});

export default createInitialState();

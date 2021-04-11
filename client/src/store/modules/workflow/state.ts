import {
  DefaultLabelingMethodType,
  FeatureExtractionMethodType,
  LabelTaskType,
  SamplingStrategyType,
} from '@/commons/types';

export interface IState {
  /** The data labeling workflow configuration parameters. */
  featureExtractionMethod: FeatureExtractionMethodType,
  /** The data sampling strategy. */
  samplingStrategy: SamplingStrategyType,
  /** The number of data objects to sample each time. */
  nBatch: number,
  /** The default labeling model type. */
  defaultLabelingMethod: DefaultLabelingMethodType,
  /** Whether to show the dataset overview. */
  showDatasetOverview: boolean,
  /** The number of data objects per row in the thumbnail matrix. */
  itemsPerRow: number,
  /** The number of data objects per column in the thumbnail matrix. */
  itemsPerCol: number,
  /** The concerned data labeling tasks. */
  labelTasks: LabelTaskType[],
}

export const createInitialState = (): IState => ({
  featureExtractionMethod: FeatureExtractionMethodType.Unsupervised,
  samplingStrategy: SamplingStrategyType.Random,
  nBatch: 48,
  defaultLabelingMethod: DefaultLabelingMethodType.Null,
  showDatasetOverview: true,
  itemsPerRow: 8,
  itemsPerCol: 6,
  labelTasks: [LabelTaskType.ImageClassification],
});

export default createInitialState();

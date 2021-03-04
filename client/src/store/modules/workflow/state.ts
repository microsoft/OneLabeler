import {
  DefaultLabelingMethodType,
  LabelTaskType,
  SamplingStrategyType,
} from '@/commons/types';

export interface IState {
  /** The data labeling workflow configuration parameters. */
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
  samplingStrategy: SamplingStrategyType.Random,
  nBatch: 32,
  defaultLabelingMethod: DefaultLabelingMethodType.Null,
  showDatasetOverview: false,
  itemsPerRow: 8,
  itemsPerCol: 4,
  labelTasks: [LabelTaskType.ImageSegmentation],
});

export default createInitialState();

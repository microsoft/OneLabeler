import {
  DefaultLabelingMethodType,
  FeatureExtractionMethodType,
  LabelTaskType,
  SamplingStrategyType,
} from '@/commons/types';
import { IState } from './state';
import * as types from './mutation-types';

export default {
  [types.SET_SHOW_DATASET_OVERVIEW](state: IState, showDatasetOverview: boolean): void {
    state.showDatasetOverview = showDatasetOverview;
  },
  [types.SET_FEATURE_EXTRACTION_METHOD](
    state: IState,
    featureExtractionMethod: FeatureExtractionMethodType,
  ): void {
    state.featureExtractionMethod = featureExtractionMethod;
  },
  [types.SET_SAMPLING_STRATEGY](
    state: IState,
    samplingStrategy: SamplingStrategyType,
  ): void {
    state.samplingStrategy = samplingStrategy;
  },
  [types.SET_DEFAULT_LABELING_METHOD](
    state: IState,
    defaultLabelingMethod: DefaultLabelingMethodType,
  ): void {
    state.defaultLabelingMethod = defaultLabelingMethod;
  },
  [types.SET_N_BATCH](state: IState, nBatch: number): void {
    state.nBatch = nBatch;
  },
  [types.SET_ITEMS_PER_ROW](state: IState, itemsPerRow: number): void {
    state.itemsPerRow = itemsPerRow;
  },
  [types.SET_ITEMS_PER_COL](state: IState, itemsPerCol: number): void {
    state.itemsPerCol = itemsPerCol;
  },
  [types.SET_LABEL_TASKS](state: IState, labelTasks: LabelTaskType[]): void {
    state.labelTasks = labelTasks;
  },
};

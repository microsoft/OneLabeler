import { DefaultLabelingModelType, Label } from '@/commons/types';
import { IState } from './state';
import * as types from './mutation-types';

export default {
  [types.SET_CLASSES](state: IState, classes: Label[]): void {
    state.classes = classes;
  },
  [types.SET_SHOW_DATASET_OVERVIEW](state: IState, showDatasetOverview: boolean): void {
    state.showDatasetOverview = showDatasetOverview;
  },
  [types.SET_QUERY_STRATEGY](state: IState, queryStrategy: string): void {
    state.queryStrategy = queryStrategy;
  },
  [types.SET_DEFAULT_LABELING_MODEL_TYPE](
    state: IState,
    defaultLabelingModelType: DefaultLabelingModelType,
  ): void {
    state.defaultLabelingModelType = defaultLabelingModelType;
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
};

import { State } from './types';
import * as types from './mutation-types';

export default {
  [types.SET_ITEMS_PER_ROW](state: State, itemsPerRow: number): void {
    state.itemsPerRow = itemsPerRow;
  },
  [types.SET_ITEMS_PER_COL](state: State, itemsPerCol: number): void {
    state.itemsPerCol = itemsPerCol;
  },
  [types.SET_SHOW_DATASET_OVERVIEW](state: State, showDatasetOverview: boolean): void {
    state.showDatasetOverview = showDatasetOverview;
  },
};

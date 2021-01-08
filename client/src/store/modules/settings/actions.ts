import { ActionContext } from 'vuex';
import * as types from './mutation-types';
import { State } from './types';

export const setItemsPerRow = (
  { commit }: ActionContext<State, State>,
  itemsPerRow: number,
): void => {
  commit(types.SET_ITEMS_PER_ROW, itemsPerRow);
};

export const setItemsPerCol = (
  { commit }: ActionContext<State, State>,
  itemsPerCol: number,
): void => {
  commit(types.SET_ITEMS_PER_COL, itemsPerCol);
};

export const setShowDatasetOverview = (
  { commit }: ActionContext<State, State>,
  showDatasetOverview: boolean,
): void => {
  commit(types.SET_SHOW_DATASET_OVERVIEW, showDatasetOverview);
};

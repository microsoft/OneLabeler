import { ActionContext } from 'vuex';
import * as API from '@/services/data-labeling-api';
import { IImage, Label, Status } from '@/commons/types';
import * as types from './mutation-types';
import * as rootTypes from '../mutation-types';
import { IState } from './state';
import { IState as IRootState } from '../state';

export const setClasses = (
  { commit }: ActionContext<IState, IRootState>,
  classes: Label[],
): void => {
  commit(types.SET_CLASSES, classes);
};

export const addClassOption = (
  { commit, state }: ActionContext<IState, IRootState>,
  className: Label,
): void => {
  const { classes } = state;
  commit(types.SET_CLASSES, [...classes, className]);
};

export const setShowDatasetOverview = (
  { commit }: ActionContext<IState, IRootState>,
  showDatasetOverview: boolean,
): void => {
  commit(types.SET_SHOW_DATASET_OVERVIEW, showDatasetOverview);
};

export const setQueryStrategy = (
  { commit }: ActionContext<IState, IRootState>,
  queryStrategy: string,
): void => {
  commit(types.SET_QUERY_STRATEGY, queryStrategy);
};

export const setNBatch = (
  { commit }: ActionContext<IState, IRootState>,
  nBatch: number,
): void => {
  commit(types.SET_N_BATCH, nBatch);
};

export const setItemsPerRow = (
  { commit }: ActionContext<IState, IRootState>,
  itemsPerRow: number,
): void => {
  commit(types.SET_ITEMS_PER_ROW, itemsPerRow);
};

export const setItemsPerCol = (
  { commit }: ActionContext<IState, IRootState>,
  itemsPerCol: number,
): void => {
  commit(types.SET_ITEMS_PER_COL, itemsPerCol);
};

export const extractDataObjects = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  files: FileList,
): Promise<void> => {
  const { unlabeledMark } = rootState;

  // Extract data objects.
  const dataObjects = (await API.extractDataObjects(files));
  commit(rootTypes.SET_DATA_OBJECTS, dataObjects, { root: true });

  // Initialize labels and label statuses.
  const labels = Array(dataObjects.length).fill(unlabeledMark);
  const statuses = Array(dataObjects.length).fill(Status.NEW);
  commit(rootTypes.SET_LABELS, labels, { root: true });
  commit(rootTypes.SET_STATUSES, statuses, { root: true });
};

export const extractFeatures = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
): Promise<void> => {
  const { dataObjects } = rootState;

  // Extract data objects.
  const response = (await API.extractFeatures(dataObjects as IImage[]));
  const updatedDataObjects = response.dataObjects;
  const { featureNames } = response;
  commit(rootTypes.SET_DATA_OBJECTS, updatedDataObjects, { root: true });
  commit(rootTypes.SET_FEATURE_NAMES, featureNames, { root: true });
};

export const sampleDataObjectsAlgorithmic = async (
  { commit, state, rootState }: ActionContext<IState, IRootState>,
): Promise<void> => {
  const { nBatch } = state;
  const {
    dataObjects,
    labels,
    statuses,
    queryIndices,
    unlabeledMark,
  } = rootState;

  // Set the labels of samples in the last batch confirmed
  const newStatuses = [...statuses];
  queryIndices.forEach((index: number) => {
    const isUnlabeled = labels[index] === unlabeledMark;
    newStatuses[index] = isUnlabeled ? Status.SKIPPED : Status.LABELED;
  });

  // Sample data objects.
  const newQueryIndices = (await API.sampleDataObjects(
    dataObjects as IImage[],
    statuses,
    nBatch,
  ));
  commit(rootTypes.SET_QUERY_INDICES, newQueryIndices, { root: true });

  // Set the labels of samples in the current batch viewed.
  newQueryIndices.forEach((index: number) => {
    newStatuses[index] = Status.VIEWED;
  });
  commit(rootTypes.SET_STATUSES, newStatuses, { root: true });
};

export const sampleDataObjectsManual = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  newQueryIndices: number[],
): Promise<void> => {
  const {
    labels,
    statuses,
    queryIndices,
    unlabeledMark,
  } = rootState;

  // Set the labels of samples in the last batch confirmed
  const newStatuses = [...statuses];
  queryIndices.forEach((index: number) => {
    const isUnlabeled = labels[index] === unlabeledMark;
    newStatuses[index] = isUnlabeled ? Status.SKIPPED : Status.LABELED;
  });

  // Sample data objects.
  commit(rootTypes.SET_QUERY_INDICES, newQueryIndices, { root: true });

  // Set the labels of samples in the current batch viewed.
  newQueryIndices.forEach((index: number) => {
    newStatuses[index] = Status.VIEWED;
  });
  commit(rootTypes.SET_STATUSES, newStatuses, { root: true });
};

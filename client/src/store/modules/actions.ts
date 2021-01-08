import { ActionContext } from 'vuex';
import * as API from '@/services/data-labeling-api';
import { ICommand, Label, Status } from '@/types';
import * as types from './mutation-types';
import { State } from './types';

export const extractDataObjects = async (
  { commit, state }: ActionContext<State, State>,
  files: FileList,
): Promise<void> => {
  const { unlabeledMark } = state;

  // Extract data objects.
  const dataObjects = (await API.extractDataObjects(files));
  commit(types.SET_DATA_OBJECTS, dataObjects);

  // Initialize labels and label statuses.
  const labels = Array(dataObjects.length).fill(unlabeledMark);
  const statuses = Array(dataObjects.length).fill(Status.NEW);
  commit(types.SET_LABELS, labels);
  commit(types.SET_STATUSES, statuses);
};

export const extractFeatures = async (
  { commit, state }: ActionContext<State, State>,
): Promise<void> => {
  const { dataObjects } = state;

  // Extract data objects.
  const response = (await API.extractFeatures(dataObjects));
  const updatedDataObjects = response.dataObjects;
  const { featureNames } = response;
  commit(types.SET_DATA_OBJECTS, updatedDataObjects);
  commit(types.SET_FEATURE_NAMES, featureNames);
};

export const sampleDataObjects = async (
  { commit, state }: ActionContext<State, State>,
): Promise<void> => {
  const {
    dataObjects,
    labels,
    statuses,
    nBatch,
    queryIndices,
    unlabeledMark,
  } = state;

  // Set the labels of samples in the last batch confirmed
  const newStatuses = [...statuses];
  queryIndices.forEach((index: number) => {
    const isUnlabeled = labels[index] === unlabeledMark;
    newStatuses[index] = isUnlabeled ? Status.SKIPPED : Status.LABELED;
  });

  // Sample data objects.
  const newQueryIndices = (await API.sampleDataObjects(dataObjects, statuses, nBatch));
  commit(types.SET_QUERY_INDICES, newQueryIndices);

  // Set the labels of samples in the current batch viewed.
  newQueryIndices.forEach((index: number) => {
    newStatuses[index] = Status.VIEWED;
  });
  commit(types.SET_STATUSES, newStatuses);
};

export const resetState = (
  { commit }: ActionContext<State, State>,
): void => {
  commit(types.SET_DATA_OBJECTS, []);
  commit(types.SET_LABELS, []);
  commit(types.SET_CLASSES, []);
  commit(types.SET_QUERY_INDICES, []);
  commit(types.SET_STATUSES, []);
};

export const addClassOption = (
  { commit, state }: ActionContext<State, State>,
  className: Label,
): void => {
  const { classes } = state;
  commit(types.SET_CLASSES, [...classes, className]);
};

export const setClasses = (
  { commit }: ActionContext<State, State>,
  classes: Label[],
): void => {
  commit(types.SET_CLASSES, classes);
};

export const setDataObjectLabel = (
  { commit }: ActionContext<State, State>,
  {
    uuid,
    label,
    inQueryIndices = false,
  }: { uuid: string, label: Label, inQueryIndices: boolean },
): void => {
  commit(types.SET_DATA_OBJECT_LABEL, { uuid, label, inQueryIndices });
};

export const setDataObjectLabels = (
  { commit }: ActionContext<State, State>,
  {
    uuids,
    labels,
    inQueryIndices = false,
  }: { uuids: string[], labels: Label[], inQueryIndices: boolean },
): void => {
  commit(types.SET_DATA_OBJECT_LABELS, { uuids, labels, inQueryIndices });
};

export const pushCommandHistory = (
  { commit, state }: ActionContext<State, State>,
  command: ICommand,
): void => {
  const { commandHistory } = state;
  const newCommandHistory = [...commandHistory, command];
  commit(types.SET_COMMAND_HISTORY, newCommandHistory);
};

export const popCommandHistory = (
  { commit, state }: ActionContext<State, State>,
): void => {
  const { commandHistory } = state;
  if (commandHistory.length === 0) {
    return;
  }
  const newCommandHistory = [...commandHistory];
  newCommandHistory.pop();
  commit(types.SET_COMMAND_HISTORY, newCommandHistory);
};

export const setQueryIndices = (
  { commit }: ActionContext<State, State>,
  queryIndices: number[],
): void => {
  commit(types.SET_QUERY_INDICES, queryIndices);
};

export const setStatuses = (
  { commit }: ActionContext<State, State>,
  statuses: Status[],
): void => {
  commit(types.SET_STATUSES, statuses);
};

export const setNBatch = (
  { commit }: ActionContext<State, State>,
  nBatch: number,
): void => {
  commit(types.SET_N_BATCH, nBatch);
};

export const setQueryStrategy = (
  { commit }: ActionContext<State, State>,
  queryStrategy: string,
): void => {
  commit(types.SET_QUERY_STRATEGY, queryStrategy);
};

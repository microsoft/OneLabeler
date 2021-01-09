import { ActionContext } from 'vuex';
import {
  ICommand,
  IDataObject,
  Label,
  Status,
} from '@/commons/types';
import * as types from './mutation-types';
import { IState } from './state';

export const setDataObjects = (
  { commit }: ActionContext<IState, IState>,
  dataObjects: IDataObject[],
): void => {
  commit(types.SET_DATA_OBJECTS, dataObjects);
};

export const setLabels = (
  { commit }: ActionContext<IState, IState>,
  labels: Label[],
): void => {
  commit(types.SET_LABELS, labels);
};

export const setDataObjectLabel = (
  { commit }: ActionContext<IState, IState>,
  {
    uuid,
    label,
    inQueryIndices = false,
  }: { uuid: string, label: Label, inQueryIndices: boolean },
): void => {
  commit(types.SET_DATA_OBJECT_LABEL, { uuid, label, inQueryIndices });
};

export const setDataObjectLabels = (
  { commit }: ActionContext<IState, IState>,
  {
    uuids,
    labels,
    inQueryIndices = false,
  }: { uuids: string[], labels: Label[], inQueryIndices: boolean },
): void => {
  commit(types.SET_DATA_OBJECT_LABELS, { uuids, labels, inQueryIndices });
};

export const setStatuses = (
  { commit }: ActionContext<IState, IState>,
  statuses: Status[],
): void => {
  commit(types.SET_STATUSES, statuses);
};

export const setUnlabeledMark = (
  { commit }: ActionContext<IState, IState>,
  unlabeledMark: Label,
): void => {
  commit(types.SET_UNLABELED_MARK, unlabeledMark);
};

export const setFeatureNames = (
  { commit }: ActionContext<IState, IState>,
  featureNames: string[],
): void => {
  commit(types.SET_FEATURE_NAMES, featureNames);
};

export const setQueryIndices = (
  { commit }: ActionContext<IState, IState>,
  queryIndices: number[],
): void => {
  commit(types.SET_QUERY_INDICES, queryIndices);
};

export const pushCommandHistory = (
  { commit, state }: ActionContext<IState, IState>,
  command: ICommand,
): void => {
  const { commandHistory } = state;
  const newCommandHistory = [...commandHistory, command];
  commit(types.SET_COMMAND_HISTORY, newCommandHistory);
};

export const popCommandHistory = (
  { commit, state }: ActionContext<IState, IState>,
): void => {
  const { commandHistory } = state;
  if (commandHistory.length === 0) {
    return;
  }
  const newCommandHistory = [...commandHistory];
  newCommandHistory.pop();
  commit(types.SET_COMMAND_HISTORY, newCommandHistory);
};

export const resetState = (
  { commit }: ActionContext<IState, IState>,
): void => {
  commit(types.SET_DATA_OBJECTS, []);
  commit(types.SET_LABELS, []);
  commit(types.SET_STATUSES, []);
  commit(types.SET_FEATURE_NAMES, []);
  commit(types.SET_QUERY_INDICES, []);
  commit(types.SET_COMMAND_HISTORY, []);
};

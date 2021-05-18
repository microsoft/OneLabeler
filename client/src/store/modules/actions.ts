import { ActionContext } from 'vuex';
import {
  Category,
  ICommand,
  IDataObject,
  IMessage,
  ILabel,
  IStatus,
  TaskWindow,
} from '@/commons/types';
import * as types from './mutation-types';
import { IState, createInitialState } from './state';

export const setDataObjects = (
  { commit }: ActionContext<IState, IState>,
  dataObjects: IDataObject[],
): void => {
  commit(types.SET_DATA_OBJECTS, dataObjects);
};

export const setClasses = (
  { commit }: ActionContext<IState, IState>,
  classes: Category[],
): void => {
  commit(types.SET_CLASSES, classes);
};

export const pushClasses = (
  { commit, state }: ActionContext<IState, IState>,
  category: Category,
): void => {
  const { classes } = state;
  commit(types.SET_CLASSES, [...classes, category]);
};

export const setStop = (
  { commit }: ActionContext<IState, IState>,
  stop: boolean,
): void => {
  commit(types.SET_STOP, stop);
};

export const setLabels = (
  { commit }: ActionContext<IState, IState>,
  labels: ILabel[],
): void => {
  commit(types.SET_LABELS, labels);
};

export const setLabelOf = (
  { commit }: ActionContext<IState, IState>,
  { uuid, label }: { uuid: string, label: ILabel },
): void => {
  commit(types.SET_LABEL_OF, { uuid, label });
};

export const setLabelsOf = (
  { commit }: ActionContext<IState, IState>,
  { uuids, labels }: { uuids: string[], labels: ILabel[] },
): void => {
  commit(types.SET_LABELS_OF, { uuids, labels });
};

export const setStatuses = (
  { commit }: ActionContext<IState, IState>,
  statuses: IStatus[],
): void => {
  commit(types.SET_STATUSES, statuses);
};

export const setStatusOf = (
  { commit }: ActionContext<IState, IState>,
  { uuid, status }: { uuid: string, status: IStatus },
): void => {
  commit(types.SET_STATUS_OF, { uuid, status });
};

export const setStatusesOf = (
  { commit }: ActionContext<IState, IState>,
  { uuids, statuses }: { uuids: string[], statuses: IStatus[] },
): void => {
  commit(types.SET_STATUSES_OF, { uuids, statuses });
};

export const setUnlabeledMark = (
  { commit }: ActionContext<IState, IState>,
  unlabeledMark: Category,
): void => {
  commit(types.SET_UNLABELED_MARK, unlabeledMark);
};

export const setFeatureNames = (
  { commit }: ActionContext<IState, IState>,
  featureNames: string[],
): void => {
  commit(types.SET_FEATURE_NAMES, featureNames);
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

export const setMessage = (
  { commit }: ActionContext<IState, IState>,
  message: IMessage,
): void => {
  commit(types.SET_MESSAGE, message);
};

export const setTaskWindows = (
  { commit }: ActionContext<IState, IState>,
  taskWindows: TaskWindow[],
): void => {
  commit(types.SET_TASK_WINDOWS, taskWindows);
};

export const editTaskWindow = (
  { commit, state }: ActionContext<IState, IState>,
  newValue: TaskWindow,
): void => {
  const { taskWindows } = state;
  const { node, process } = newValue;
  const idx = taskWindows.findIndex((d) => (
    d.node.id === node.id && d.process.id === process.id
  ));
  const taskWindowsUpdated = [...taskWindows];
  taskWindowsUpdated[idx] = newValue;
  commit(types.SET_TASK_WINDOWS, taskWindowsUpdated);
};

export const resetState = (
  { commit }: ActionContext<IState, IState>,
): void => {
  const {
    dataObjects,
    classes,
    labels,
    statuses,
    unlabeledMark,
    featureNames,
    queryUuids,
    commandHistory,
    message,
  } = createInitialState();
  commit(types.SET_DATA_OBJECTS, dataObjects);
  commit(types.SET_CLASSES, classes);
  commit(types.SET_LABELS, labels);
  commit(types.SET_STATUSES, statuses);
  commit(types.SET_UNLABELED_MARK, unlabeledMark);
  commit(types.SET_FEATURE_NAMES, featureNames);
  commit(types.SET_QUERY_UUIDS, queryUuids);
  commit(types.SET_COMMAND_HISTORY, commandHistory);
  commit(types.SET_MESSAGE, message);
};

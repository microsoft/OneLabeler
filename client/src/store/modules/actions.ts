import { ActionContext } from 'vuex';
import {
  ICommand,
  IDataObject,
  IMessage,
  ILabelMask,
  ILabelGeometricObject,
  Label,
  Status,
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
  classes: Label[],
): void => {
  commit(types.SET_CLASSES, classes);
};

export const pushClasses = (
  { commit, state }: ActionContext<IState, IState>,
  className: Label,
): void => {
  const { classes } = state;
  commit(types.SET_CLASSES, [...classes, className]);
};

export const setStop = (
  { commit }: ActionContext<IState, IState>,
  stop: boolean,
): void => {
  commit(types.SET_STOP, stop);
};

export const setLabels = (
  { commit }: ActionContext<IState, IState>,
  labels: Label[],
): void => {
  commit(types.SET_LABELS, labels);
};

export const setLabelGeometricObjects = (
  { commit }: ActionContext<IState, IState>,
  labelGeometricObjects: ILabelGeometricObject[],
): void => {
  commit(types.SET_LABEL_GEOMETRIC_OBJECTS, labelGeometricObjects);
};

export const setLabelMasks = (
  { commit }: ActionContext<IState, IState>,
  labelMasks: ILabelMask[],
): void => {
  commit(types.SET_LABEL_MASKS, labelMasks);
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

export const setDataObjectLabelMask = (
  { commit }: ActionContext<IState, IState>,
  {
    uuid,
    labelMask,
    inQueryIndices = false,
  }: { uuid: string, labelMask: ILabelMask, inQueryIndices: boolean },
): void => {
  commit(types.SET_DATA_OBJECT_LABEL_MASK, { uuid, labelMask, inQueryIndices });
};

export const setDataObjectLabelGeometricObjects = (
  { commit }: ActionContext<IState, IState>,
  {
    uuid,
    labelGeometricObjects,
    inQueryIndices = false,
  }: {
    uuid: string,
    labelGeometricObjects: ILabelGeometricObject[],
    inQueryIndices: boolean,
  },
): void => {
  commit(
    types.SET_DATA_OBJECT_LABEL_GEOMETRIC_OBJECTS,
    { uuid, labelGeometricObjects, inQueryIndices },
  );
};

export const setStatuses = (
  { commit }: ActionContext<IState, IState>,
  statuses: Status[],
): void => {
  commit(types.SET_STATUSES, statuses);
};

export const setStatusOf = (
  { commit }: ActionContext<IState, IState>,
  {
    uuid,
    status,
    inQueryIndices = false,
  }: { uuid: string, status: Status, inQueryIndices: boolean },
): void => {
  commit(types.SET_STATUS_OF, { uuid, status, inQueryIndices });
};

export const setStatusesOf = (
  { commit }: ActionContext<IState, IState>,
  {
    uuids,
    statuses,
    inQueryIndices = false,
  }: { uuids: string[], statuses: Status[], inQueryIndices: boolean },
): void => {
  commit(types.SET_STATUSES_OF, { uuids, statuses, inQueryIndices });
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
    queryIndices,
    commandHistory,
    message,
  } = createInitialState();
  commit(types.SET_DATA_OBJECTS, dataObjects);
  commit(types.SET_CLASSES, classes);
  commit(types.SET_LABELS, labels);
  commit(types.SET_STATUSES, statuses);
  commit(types.SET_UNLABELED_MARK, unlabeledMark);
  commit(types.SET_FEATURE_NAMES, featureNames);
  commit(types.SET_QUERY_INDICES, queryIndices);
  commit(types.SET_COMMAND_HISTORY, commandHistory);
  commit(types.SET_MESSAGE, message);
};

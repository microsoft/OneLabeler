import { ActionContext } from 'vuex';
import {
  Category,
  ICommand,
  IDataObject,
  ILabel,
  IMessage,
  IStatus,
  TaskWindow,
} from '@/commons/types';
import * as types from './mutation-types';
import { IState, createInitialState } from './state';

export const setLabelOf = async (
  { commit, state }: ActionContext<IState, IState>,
  label: ILabel,
): Promise<void> => {
  if (state.labels === null) return;
  await state.labels.set(label);
  commit(types.SET_LABELS, state.labels.shallowCopy());
};

export const setLabelsOf = async (
  { commit, state }: ActionContext<IState, IState>,
  labels: ILabel[],
): Promise<void> => {
  if (state.labels === null) return;
  await state.labels.setBulk(labels);
  commit(types.SET_LABELS, state.labels.shallowCopy());
};

export const setStatusOf = async (
  { commit, state }: ActionContext<IState, IState>,
  status: IStatus,
): Promise<void> => {
  if (state.statuses === null) return;
  await state.statuses.set(status);
  commit(types.SET_STATUSES, state.statuses.shallowCopy());
};

export const setStatusesOf = async (
  { commit, state }: ActionContext<IState, IState>,
  statuses: IStatus[],
): Promise<void> => {
  if (state.statuses === null) return;
  await state.statuses.setBulk(statuses);
  commit(types.SET_STATUSES, state.statuses.shallowCopy());
};

export const setStop = (
  { commit }: ActionContext<IState, IState>,
  stop: boolean,
): void => {
  commit(types.SET_STOP, stop);
};

export const pushClasses = (
  { commit, state }: ActionContext<IState, IState>,
  category: Category,
): void => {
  const { classes } = state;
  commit(types.SET_CLASSES, [...classes, category]);
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

type ProjectData = {
  dataObjects: IDataObject[];
  labels: ILabel[];
  statuses: IStatus[];
  classes: Category[];
  unlabeledMark: Category;
  featureNames?: string[];
}

export const setProject = (
  { commit }: ActionContext<IState, IState>,
  projectData: ProjectData,
): void => {
  const {
    dataObjects,
    classes,
    labels,
    statuses,
    unlabeledMark,
    featureNames,
  } = projectData;
  commit(types.SET_DATA_OBJECTS, dataObjects);
  commit(types.SET_CLASSES, classes);
  commit(types.SET_LABELS, labels);
  commit(types.SET_STATUSES, statuses);
  commit(types.SET_UNLABELED_MARK, unlabeledMark);
  commit(types.SET_FEATURE_NAMES,
    featureNames === undefined ? [] : featureNames);
};

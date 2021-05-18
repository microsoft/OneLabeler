import {
  Category,
  ICommand,
  IDataObject,
  IMessage,
  ILabel,
  IStatus,
  StatusType,
  TaskWindow,
} from '@/commons/types';
import { IState } from './state';
import * as types from './mutation-types';

export default {
  [types.SET_DATA_OBJECTS](state: IState, dataObjects: IDataObject[]): void {
    state.dataObjects = dataObjects;
  },
  [types.SET_CLASSES](state: IState, classes: Category[]): void {
    state.classes = classes;
  },
  [types.SET_STOP](state: IState, stop: boolean): void {
    state.stop = stop;
  },
  [types.SET_LABELS](state: IState, labels: ILabel[]): void {
    state.labels = labels;
  },
  [types.SET_LABEL_OF](
    state: IState,
    { uuid, label }: { uuid: string, label: ILabel },
  ): void {
    const { labels } = state;
    const newLabels = [...labels];
    const idx = labels.findIndex((d) => d.uuid === uuid);
    newLabels[idx] = label;
    state.labels = newLabels;
  },
  [types.SET_LABELS_OF](
    state: IState,
    { uuids, labels }: { uuids: string[], labels: ILabel[] },
  ): void {
    const newLabels = [...state.labels];
    uuids.forEach((uuid: string, i: number) => {
      const label = labels[i];
      const idx = state.labels.findIndex((d) => d.uuid === uuid);
      newLabels[idx] = label;
    });
    state.labels = newLabels;
  },
  [types.SET_STATUSES](state: IState, statuses: IStatus[]): void {
    state.statuses = statuses;
  },
  [types.SET_STATUS_OF](
    state: IState,
    { uuid, status }: { uuid: string, status: IStatus },
  ): void {
    const { statuses } = state;
    const newStatuses = [...state.statuses];
    const idx = statuses.findIndex((d) => d.uuid === uuid);
    newStatuses[idx as number] = status;
    state.statuses = newStatuses;
  },
  [types.SET_STATUSES_OF](
    state: IState,
    { uuids, statuses }: { uuids: string[], statuses: IStatus[] },
  ): void {
    const newStatuses = [...state.statuses];
    uuids.forEach((uuid: string, i: number) => {
      const status = statuses[i];
      const idx = state.statuses.findIndex((d) => d.uuid === uuid);
      newStatuses[idx] = status;
    });
    state.statuses = newStatuses;
  },
  [types.SET_UNLABELED_MARK](state: IState, unlabeledMark: Category): void {
    state.unlabeledMark = unlabeledMark;
  },
  [types.SET_FEATURE_NAMES](state: IState, featureNames: string[]): void {
    state.featureNames = featureNames;
  },
  [types.SET_QUERY_UUIDS](state: IState, queryUuids: string[]): void {
    state.queryUuids = queryUuids;
  },
  [types.SET_COMMAND_HISTORY](state: IState, commandHistory: ICommand[]): void {
    state.commandHistory = commandHistory;
  },
  [types.SET_MESSAGE](state: IState, message: IMessage): void {
    state.message = message;
  },
  [types.SET_TASK_WINDOWS](state: IState, taskWindows: TaskWindow[]): void {
    state.taskWindows = taskWindows;
  },
};

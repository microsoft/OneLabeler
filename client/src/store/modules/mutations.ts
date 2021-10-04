import {
  Category,
  ICommand,
  IDataObjectStorage,
  ILabelStorage,
  IMessage,
  IStatusStorage,
  LabelTaskType,
  SourceService,
  StorageService,
  TaskWindow,
  DockSideType,
} from '@/commons/types';
import { IState } from './state';
import * as types from './mutation-types';

export default {
  [types.SET_DATA_OBJECTS](state: IState, dataObjects: IDataObjectStorage): void {
    state.dataObjects = dataObjects;
  },
  [types.SET_CLASSES](state: IState, classes: Category[]): void {
    state.classes = classes;
  },
  [types.SET_CATEGORY_TASKS](
    state: IState,
    categoryTasks: Record<Category, LabelTaskType[] | null>,
  ): void {
    state.categoryTasks = categoryTasks;
  },
  [types.SET_STOP](state: IState, stop: boolean): void {
    state.stop = stop;
  },
  [types.SET_LABELS](state: IState, labels: ILabelStorage): void {
    state.labels = labels;
  },
  [types.SET_STATUSES](state: IState, statuses: IStatusStorage): void {
    state.statuses = statuses;
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
  [types.SET_SCOPE_UUIDS](state: IState, scopeUuids: string[]): void {
    state.scopeUuids = scopeUuids;
  },
  [types.SET_DOCK_SIDE](state: IState, dockSide: DockSideType): void {
    state.dockSide = dockSide;
  },
  [types.SET_COLOR_MAPPER](state: IState, colorMapper: Record<string, string>): void {
    state.colorMapper = colorMapper;
  },
  [types.SET_SOURCE_SERVICE](state: IState, service: SourceService): void {
    state.sourceService = service;
  },
  [types.SET_SOURCE_SERVICES](state: IState, services: SourceService[]): void {
    state.sourceServices = services;
  },
  [types.SET_STORAGE_SERVICE](state: IState, service: StorageService): void {
    state.storageService = service;
  },
  [types.SET_STORAGE_SERVICES](state: IState, services: StorageService[]): void {
    state.storageServices = services;
  },
};

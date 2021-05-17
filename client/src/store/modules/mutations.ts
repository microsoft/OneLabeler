import {
  Category,
  ICommand,
  IDataObject,
  IMessage,
  ILabelShape,
  ILabelMask,
  ILabelCategory,
  Status,
  TaskWindow,
} from '@/commons/types';
import { IState } from './state';
import * as types from './mutation-types';

export default {
  [types.SET_DATA_OBJECTS](state: IState, dataObjects: IDataObject[]): void {
    state.dataObjects = dataObjects;
    const uuidToIdx: { [key: string]: number} = {};
    dataObjects.forEach((dataObject, i) => {
      uuidToIdx[dataObject.uuid] = i;
    });
    state.uuidToIdx = uuidToIdx;
  },
  [types.SET_CLASSES](state: IState, classes: Category[]): void {
    state.classes = classes;
  },
  [types.SET_STOP](state: IState, stop: boolean): void {
    state.stop = stop;
  },
  [types.SET_LABELS](state: IState, labels: ILabelCategory[]): void {
    state.labels = labels;
  },
  [types.SET_LABEL_SHAPE_LISTS](
    state: IState,
    labelShapeLists: ILabelShape[][],
  ): void {
    state.labelShapeLists = labelShapeLists;
  },
  [types.SET_LABEL_MASKS](state: IState, labelMasks: ILabelMask[]): void {
    state.labelMasks = labelMasks;
  },
  [types.SET_LABEL_OF](
    state: IState,
    {
      uuid,
      label,
      queried,
    }: { uuid: string, label: ILabelCategory, queried: boolean },
  ): void {
    if (state.labels === null) return;
    const { dataObjects, queryIndices } = state;
    const newLabels = [...state.labels];
    const idx = queried
      ? queryIndices.find((d: number) => dataObjects[d].uuid === uuid)
      : dataObjects.findIndex((d: IDataObject) => d.uuid === uuid);
    newLabels[idx as number] = label;
    state.labels = newLabels;
  },
  [types.SET_LABELS_OF](
    state: IState,
    {
      uuids,
      labels,
      queried,
    }: { uuids: string[], labels: ILabelCategory[], queried: boolean },
  ): void {
    if (state.labels === null) return;
    const { dataObjects, queryIndices } = state;
    const newLabels = [...state.labels];
    uuids.forEach((uuid: string, i: number) => {
      const label = labels[i];
      const idx = queried
        ? queryIndices.find((d: number) => dataObjects[d].uuid === uuid)
        : dataObjects.findIndex((d: IDataObject) => d.uuid === uuid);
      newLabels[idx as number] = label;
    });
    state.labels = newLabels;
  },
  [types.SET_LABEL_MASK_OF](
    state: IState,
    {
      uuid,
      labelMask,
      queried,
    }: { uuid: string, labelMask: ILabelMask, queried: boolean },
  ): void {
    if (state.labelMasks === null) return;
    const { dataObjects, queryIndices } = state;
    const newLabelMasks = [...state.labelMasks];
    const idx = queried
      ? queryIndices.find((d: number) => dataObjects[d].uuid === uuid)
      : dataObjects.findIndex((d: IDataObject) => d.uuid === uuid);
    newLabelMasks[idx as number] = labelMask;
    state.labelMasks = newLabelMasks;
  },
  [types.SET_LABEL_SHAPE_LIST_OF](
    state: IState,
    {
      uuid,
      labelShapeList,
      queried,
    }: {
        uuid: string,
        labelShapeList: ILabelShape[],
        queried: boolean,
    },
  ): void {
    if (state.labelShapeLists === null) return;
    const { dataObjects, queryIndices } = state;
    const newLabelShapeLists = [...state.labelShapeLists];
    const idx = queried
      ? queryIndices.find((d: number) => dataObjects[d].uuid === uuid)
      : dataObjects.findIndex((d: IDataObject) => d.uuid === uuid);
    newLabelShapeLists[idx as number] = labelShapeList;
    state.labelShapeLists = newLabelShapeLists;
  },
  [types.SET_STATUSES](state: IState, statuses: Status[]): void {
    state.statuses = statuses;
  },
  [types.SET_STATUS_OF](
    state: IState,
    {
      uuid,
      status,
      queried,
    }: { uuid: string, status: Status, queried: boolean },
  ): void {
    if (state.statuses === null) return;
    const { dataObjects, queryIndices } = state;
    const newStatuses = [...state.statuses];
    const idx = queried
      ? queryIndices.find((d: number) => dataObjects[d].uuid === uuid)
      : dataObjects.findIndex((d: IDataObject) => d.uuid === uuid);
    newStatuses[idx as number] = status;
    state.statuses = newStatuses;
  },
  [types.SET_STATUSES_OF](
    state: IState,
    {
      uuids,
      statuses,
      queried,
    }: { uuids: string[], statuses: Status[], queried: boolean },
  ): void {
    if (state.statuses === null) return;
    const { dataObjects, queryIndices } = state;
    const newStatuses = [...state.statuses];
    uuids.forEach((uuid: string, i: number) => {
      const status = statuses[i];
      const idx = queried
        ? queryIndices.find((d: number) => dataObjects[d].uuid === uuid)
        : dataObjects.findIndex((d: IDataObject) => d.uuid === uuid);
      newStatuses[idx as number] = status;
    });
    state.statuses = newStatuses;
  },
  [types.SET_UNLABELED_MARK](state: IState, unlabeledMark: Category): void {
    state.unlabeledMark = unlabeledMark;
  },
  [types.SET_FEATURE_NAMES](state: IState, featureNames: string[]): void {
    state.featureNames = featureNames;
  },
  [types.SET_QUERY_INDICES](state: IState, queryIndices: number[]): void {
    state.queryIndices = queryIndices;
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

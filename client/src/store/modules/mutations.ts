import {
  ICommand,
  IDataObject,
  IMessage,
  ILabelGeometricObject,
  ILabelMask,
  Label,
  Status,
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
  [types.SET_CLASSES](state: IState, classes: Label[]): void {
    state.classes = classes;
  },
  [types.SET_STOP](state: IState, stop: boolean): void {
    state.stop = stop;
  },
  [types.SET_LABELS](state: IState, labels: Label[]): void {
    state.labels = labels;
  },
  [types.SET_LABEL_GEOMETRIC_OBJECTS](
    state: IState,
    labelGeometricObjects: ILabelGeometricObject[][],
  ): void {
    state.labelGeometricObjects = labelGeometricObjects;
  },
  [types.SET_LABEL_MASKS](state: IState, labelMasks: ILabelMask[]): void {
    state.labelMasks = labelMasks;
  },
  [types.SET_DATA_OBJECT_LABEL](
    state: IState,
    {
      uuid,
      label,
      inQueryIndices,
    }: { uuid: string, label: Label, inQueryIndices: boolean },
  ): void {
    const { dataObjects, queryIndices } = state;
    const newLabels = [...state.labels];
    const idx = inQueryIndices
      ? queryIndices.find((d: number) => dataObjects[d].uuid === uuid)
      : dataObjects.findIndex((d: IDataObject) => d.uuid === uuid);
    newLabels[idx as number] = label;
    state.labels = newLabels;
  },
  [types.SET_DATA_OBJECT_LABELS](
    state: IState,
    {
      uuids,
      labels,
      inQueryIndices,
    }: { uuids: string[], labels: Label[], inQueryIndices: boolean },
  ): void {
    const { dataObjects, queryIndices } = state;
    const newLabels = [...state.labels];
    uuids.forEach((uuid: string, i: number) => {
      const label = labels[i];
      const idx = inQueryIndices
        ? queryIndices.find((d: number) => dataObjects[d].uuid === uuid)
        : dataObjects.findIndex((d: IDataObject) => d.uuid === uuid);
      newLabels[idx as number] = label;
    });
    state.labels = newLabels;
  },
  [types.SET_DATA_OBJECT_LABEL_MASK](
    state: IState,
    {
      uuid,
      labelMask,
      inQueryIndices,
    }: { uuid: string, labelMask: ILabelMask, inQueryIndices: boolean },
  ): void {
    const { dataObjects, queryIndices } = state;
    const newLabelMasks = [...state.labelMasks];
    const idx = inQueryIndices
      ? queryIndices.find((d: number) => dataObjects[d].uuid === uuid)
      : dataObjects.findIndex((d: IDataObject) => d.uuid === uuid);
    newLabelMasks[idx as number] = labelMask;
    state.labelMasks = newLabelMasks;
  },
  [types.SET_DATA_OBJECT_LABEL_GEOMETRIC_OBJECTS](
    state: IState,
    {
      uuid,
      labelGeometricObjects,
      inQueryIndices,
    }: {
        uuid: string,
        labelGeometricObjects: ILabelGeometricObject[],
        inQueryIndices: boolean,
    },
  ): void {
    const { dataObjects, queryIndices } = state;
    const newLabelGeometricObjects = [...state.labelGeometricObjects];
    const idx = inQueryIndices
      ? queryIndices.find((d: number) => dataObjects[d].uuid === uuid)
      : dataObjects.findIndex((d: IDataObject) => d.uuid === uuid);
    newLabelGeometricObjects[idx as number] = labelGeometricObjects;
    state.labelGeometricObjects = newLabelGeometricObjects;
  },
  [types.SET_STATUSES](state: IState, statuses: Status[]): void {
    state.statuses = statuses;
  },
  [types.SET_UNLABELED_MARK](state: IState, unlabeledMark: Label): void {
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
};

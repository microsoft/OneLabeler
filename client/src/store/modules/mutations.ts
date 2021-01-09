import {
  ICommand,
  IDataObject,
  Label,
  Status,
} from '@/commons/types';
import { IState } from './state';
import * as types from './mutation-types';

export default {
  [types.SET_DATA_OBJECTS](state: IState, dataObjects: IDataObject[]): void {
    state.dataObjects = dataObjects;
  },
  [types.SET_LABELS](state: IState, labels: Label[]): void {
    state.labels = labels;
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
    console.assert(idx !== undefined && idx >= 0,
      `Data object not found: uuid = ${uuid}`);
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
      console.assert(idx !== undefined && idx >= 0, `Data object not found: uuid = ${uuid}`);
      newLabels[idx as number] = label;
    });
    state.labels = newLabels;
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
};

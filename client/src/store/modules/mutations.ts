import {
  ICommand,
  IImage,
  Label,
  Status,
} from '@/types';
import { State } from './types';
import * as types from './mutation-types';

export default {
  [types.SET_DATA_OBJECTS](state: State, dataObjects: IImage[]): void {
    state.dataObjects = dataObjects;
  },
  [types.SET_LABELS](state: State, labels: Label[]): void {
    state.labels = labels;
  },
  [types.SET_CLASSES](state: State, classes: Label[]): void {
    state.classes = classes;
  },
  [types.SET_QUERY_INDICES](state: State, queryIndices: number[]): void {
    state.queryIndices = queryIndices;
  },
  [types.SET_STATUSES](state: State, statuses: Status[]): void {
    state.statuses = statuses;
  },
  [types.SET_N_BATCH](state: State, nBatch: number): void {
    state.nBatch = nBatch;
  },
  [types.SET_QUERY_STRATEGY](state: State, queryStrategy: string): void {
    state.queryStrategy = queryStrategy;
  },
  [types.SET_COMMAND_HISTORY](state: State, commandHistory: ICommand[]): void {
    state.commandHistory = commandHistory;
  },
  [types.SET_DATA_OBJECT_LABEL](
    state: State,
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
      : dataObjects.findIndex((d: IImage) => d.uuid === uuid);
    console.assert(idx !== undefined && idx >= 0,
      `Data object not found: uuid = ${uuid}`);
    newLabels[idx as number] = label;
    state.labels = newLabels;
  },
  [types.SET_DATA_OBJECT_LABELS](
    state: State,
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
        : dataObjects.findIndex((d: IImage) => d.uuid === uuid);
      console.assert(idx !== undefined && idx >= 0, `Data object not found: uuid = ${uuid}`);
      newLabels[idx as number] = label;
    });
    state.labels = newLabels;
  },
  [types.SET_FEATURE_NAMES](state: State, featureNames: string[]): void {
    state.featureNames = featureNames;
  },
};

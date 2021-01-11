import {
  ICommand,
  IDataObject,
  Label,
  Status,
} from '@/commons/types';

export interface IState {
  dataObjects: IDataObject[],
  labels: Label[],
  statuses: Status[],
  unlabeledMark: Label,
  featureNames: string[],
  uuidToIdx: { [key: string]: number },
  queryIndices: number[],
  commandHistory: ICommand[],
}

export default {
  /** The data labeling project record attributes. */
  /** The data objects to be labeled */
  dataObjects: [],
  /** The data object labels. */
  labels: [],
  /** The label statuses of the data objects. */
  statuses: [],
  /** The label mark of unlabeled data objects. */
  unlabeledMark: -1,
  /** The names of data object features. */
  featureNames: [],
  /** The mapping from uuids to data object index. */
  uuidToIdx: {},

  /** The data labeling system status attributes. */
  /** The indices of sampled data objects. */
  queryIndices: [],
  /** The history of label editing commands (used for undo command). */
  commandHistory: [],
} as IState;

import {
  ICommand,
  IDataObject,
  IMessage,
  ILabelMask,
  ILabelGeometricObject,
  Label,
  Status,
} from '@/commons/types';

export interface IState {
  /** The data labeling project record attributes. */
  /** The data objects to be labeled */
  dataObjects: IDataObject[];
  /** The label category options. */
  classes: Label[];
  /** The decision whether the data labeling process should stop. */
  stop: boolean;
  /** The data object labels. */
  labels: Label[] | null;
  /** The data object geometric object annotations (one image can contain multiple objects). */
  labelGeometricObjects: ILabelGeometricObject[][] | null;
  /** The data object segmentation masks. */
  labelMasks: ILabelMask[] | null;
  /** The label statuses of the data objects. */
  statuses: Status[];
  /** The label mark of unlabeled data objects. */
  unlabeledMark: Label;
  /** The names of data object features. */
  featureNames: string[];

  /** The data labeling system status attributes. */
  /** The cache storing mapping from uuids to data object index. */
  uuidToIdx: { [key: string]: number };
  /** The indices of sampled data objects. */
  queryIndices: number[];
  /** The history of label editing commands (used for undo command). */
  commandHistory: ICommand[];
  /** The popup message to be shown in the interface. */
  message: IMessage | null;
}

export const createInitialState = (): IState => ({
  dataObjects: [],
  classes: [],
  stop: false,
  labels: null,
  labelGeometricObjects: null,
  labelMasks: null,
  statuses: [],
  unlabeledMark: '-1',
  featureNames: [],
  uuidToIdx: {},
  queryIndices: [],
  commandHistory: [],
  message: null,
});

export default createInitialState();

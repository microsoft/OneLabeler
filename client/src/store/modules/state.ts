import {
  ICommand,
  IDataObject,
  IMessage,
  ILabelMask,
  ILabelShape,
  Label,
  Status,
  TaskWindow,
} from '@/commons/types';

export interface IState {
  /** The data labeling project record attributes. */
  /** The data objects to be labeled */
  dataObjects: IDataObject[];
  /** The label category options. */
  classes: Label[];
  /** The decision whether the data labeling process should stop. */
  stop: boolean;
  /** The labels. */
  labels: Label[] | null;
  /** The object shapes annotations. */
  labelShapeLists: ILabelShape[][] | null;
  /** The segmentation masks. */
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
  /** The task windows in the interface. */
  taskWindows: TaskWindow[];
}

export const createInitialState = (): IState => ({
  dataObjects: [],
  classes: [],
  stop: false,
  labels: null,
  labelShapeLists: null,
  labelMasks: null,
  statuses: [],
  unlabeledMark: '-1',
  featureNames: [],
  uuidToIdx: {},
  queryIndices: [],
  commandHistory: [],
  message: null,
  taskWindows: [],
});

export default createInitialState();

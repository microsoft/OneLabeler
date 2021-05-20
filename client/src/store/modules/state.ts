import {
  Category,
  ICommand,
  IDataObjectStorage,
  ILabelStorage,
  IMessage,
  IStatusStorage,
  TaskWindow,
} from '@/commons/types';

export interface IState {
  /** The data labeling project record attributes. */
  /** The data objects to be labeled */
  dataObjects: IDataObjectStorage | null;
  /** The labels (unlabeled data objects' labels not stored). */
  labels: ILabelStorage | null;
  /** The label statuses (unlabeled data objects' statuses not stored). */
  statuses: IStatusStorage | null;
  /** The uuids of sampled data objects. */
  queryUuids: string[];
  /** The decision whether the data labeling process should stop. */
  stop: boolean;
  /** The label category options. */
  classes: Category[];
  /** The label mark of unlabeled data objects. */
  unlabeledMark: Category;
  /** The names of data object features. */
  featureNames: string[];

  /** The data labeling system status attributes. */
  /** The uuids of data objects visible in the interface. */
  scopeUuids: string[] | null;
  /** The history of label editing commands (used for undo command). */
  commandHistory: ICommand[];
  /** The popup message to be shown in the interface. */
  message: IMessage | null;
  /** The task windows in the interface. */
  taskWindows: TaskWindow[];
}

export const createInitialState = (): IState => ({
  dataObjects: null,
  labels: null,
  statuses: null,
  queryUuids: [],
  stop: false,
  classes: [],
  unlabeledMark: '-1',
  featureNames: [],
  scopeUuids: null,
  commandHistory: [],
  message: null,
  taskWindows: [],
});

export default createInitialState();

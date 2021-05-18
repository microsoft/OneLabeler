import {
  Category,
  ICommand,
  IDataObject,
  IMessage,
  ILabel,
  IStatus,
  TaskWindow,
} from '@/commons/types';

export interface IState {
  /** The data labeling project record attributes. */
  /** The data objects to be labeled */
  dataObjects: IDataObject[];
  /** The label category options. */
  classes: Category[];
  /** The decision whether the data labeling process should stop. */
  stop: boolean;
  /** The labels. */
  labels: ILabel[];
  /** The label statuses of the data objects. */
  statuses: IStatus[];
  /** The label mark of unlabeled data objects. */
  unlabeledMark: Category;
  /** The names of data object features. */
  featureNames: string[];

  /** The data labeling system status attributes. */
  /** The uuids of sampled data objects. */
  queryUuids: string[];
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
  labels: [],
  statuses: [],
  unlabeledMark: '-1',
  featureNames: [],
  queryUuids: [],
  commandHistory: [],
  message: null,
  taskWindows: [],
});

export default createInitialState();

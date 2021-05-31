import {
  Category,
  ICommand,
  IDataObjectStorage,
  ILabelStorage,
  IMessage,
  IStatusStorage,
  SourceService,
  StorageService,
  TaskWindow,
} from '@/commons/types';
import {
  storageServices,
  sourceServices,
} from '@/builtins/data-services';

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

  /** The service for transferring dataset to the client. */
  sourceService: SourceService;
  /** Alternative services for transferring dataset to the client. */
  sourceServices: SourceService[];
  /** The service for storing dataset. */
  storageServices: StorageService[];
  /** Alternative services for storing dataset. */
  storageService: StorageService;
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
  sourceService: sourceServices[0],
  sourceServices,
  storageService: storageServices[0],
  storageServices,
});

export default createInitialState();

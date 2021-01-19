import {
  DefaultLabelingModelType,
  ICommand,
  IDataObject,
  IMessage,
  IModel,
  Label,
  Status,
} from '@/commons/types';

export interface IState {
  /** The data labeling project record attributes. */
  /** The data objects to be labeled */
  dataObjects: IDataObject[],
  /** The data object labels. */
  labels: Label[],
  /** The label statuses of the data objects. */
  statuses: Status[],
  /** The model for default labeling and active sampling. */
  model: IModel,
  /** The label mark of unlabeled data objects. */
  unlabeledMark: Label,
  /** The names of data object features. */
  featureNames: string[],
  /** The mapping from uuids to data object index. */
  uuidToIdx: { [key: string]: number },

  /** The data labeling system status attributes. */
  /** The indices of sampled data objects. */
  queryIndices: number[],
  /** The history of label editing commands (used for undo command). */
  commandHistory: ICommand[],
  /** The popup message to be shown in the interface. */
  message: IMessage | null,
}

export const createInitialState = (): IState => ({
  dataObjects: [],
  labels: [],
  statuses: [],
  model: {
    type: DefaultLabelingModelType.Null,
    content: null,
  },
  unlabeledMark: '-1',
  featureNames: [],
  uuidToIdx: {},
  queryIndices: [],
  commandHistory: [],
  message: null,
});

export default createInitialState();

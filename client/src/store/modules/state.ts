import {
  DefaultLabelingMethodType,
  ICommand,
  IDataObject,
  IMessage,
  IModel,
  ILabelMask,
  ILabelPolygon,
  Label,
  SamplingStrategyType,
  Status,
} from '@/commons/types';

export interface IState {
  /** The data labeling project record attributes. */
  /** The data objects to be labeled */
  dataObjects: IDataObject[],
  /** The label category options. */
  classes: Label[],
  /** The data object labels. */
  labels: Label[],
  /** The data object segmentation masks. */
  labelMasks: ILabelMask[],
  /** The data object polygon annotations (one image can contain multiple polygons). */
  labelPolygons: ILabelPolygon[][],
  /** The label statuses of the data objects. */
  statuses: Status[],
  /** The model for default labeling and active sampling. */
  model: IModel,
  /** The label mark of unlabeled data objects. */
  unlabeledMark: Label,
  /** The names of data object features. */
  featureNames: string[],

  /** The data labeling system status attributes. */
  /** The cache storing mapping from uuids to data object index. */
  uuidToIdx: { [key: string]: number },
  /** The indices of sampled data objects. */
  queryIndices: number[],
  /** The history of label editing commands (used for undo command). */
  commandHistory: ICommand[],
  /** The popup message to be shown in the interface. */
  message: IMessage | null,
}

export const createInitialState = (): IState => ({
  dataObjects: [],
  classes: [],
  labels: [],
  labelMasks: [],
  labelPolygons: [],
  statuses: [],
  model: {
    type: DefaultLabelingMethodType.Null,
    samplingStrategy: SamplingStrategyType.Random,
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

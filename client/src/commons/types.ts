/** The interface of a data object to be labeled. */
export interface IDataObject {
  /** The universal unique id of the data object. */
  uuid: string,
  /** The features of the data object. */
  features?: number[],
}

/** The interface of an image data object. */
export interface IImage extends IDataObject {
  /** The storage path of the image on the server. */
  path: string | null,
  /** The width of the image. */
  width?: number | null,
  /** The height of the image. */
  height?: number | null,
}

/** The type of data labels. */
export type Label = string

/** The enum of label status types. */
export enum Status {
  /** The data object is not viewed and not labeled. */
  NEW = 'NEW',
  /** The data object is viewed but not yet labeled. */
  VIEWED = 'VIEWED',
  /** The data object is viewed but skipped. */
  SKIPPED = 'SKIPPED',
  /** The data object is labeled. */
  LABELED = 'LABELED',
}

export interface ICommand {
  execute: () => void;
  undo: () => void;
}

/** The enum of alert message types. */
export enum MessageType {
  error = 'error',
  success = 'success',
}

/** The interface of an alert message. */
export interface IMessage {
  content: string,
  type: MessageType,
}

/** The enum of data object sampling strategy types. */
export enum SamplingStrategyType {
  Random = 'Random',
  ClusterCentroids = 'ClusterCentroids',
  DenseAreas = 'DenseAreas',
  Entropy = 'Entropy',
  EntropyDiversity = 'EntropyDiversity',
  EntropyDiversityDensity = 'EntropyDiversityDensity',
  LeastConfident = 'LeastConfident',
  SmallestMargin = 'SmallestMargin',
}

/** The enum of default labeling model types. */
export enum DefaultLabelingMethodType {
  Null = 'Null',
  Random = 'Random',
  DecisionTree = 'DecisionTree',
  SVM = 'SVM',
  LogisticRegression = 'LogisticRegression',
  LabelSpreading = 'LabelSpreading',
  RestrictedBoltzmannMachine = 'RestrictedBoltzmannMachine',
}

/** The enum of projection method types. */
export enum ProjectionMethodType {
  PCA = 'PCA',
  MDS = 'MDS',
  TSNE = 't-SNE',
}

/** The interface of default labeling and active sampling model. */
export interface IModel {
  /** The default labeling model type. */
  type: DefaultLabelingMethodType,
  /** The data object sampling strategy. */
  samplingStrategy: SamplingStrategyType,
  /** The key to the model object stored in the backend. */
  content: string | null,
}

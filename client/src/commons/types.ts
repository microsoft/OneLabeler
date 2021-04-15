/** The interface of a data object to be labeled. */
export interface IDataObject {
  /** The universal unique id of the data object. */
  uuid: string;
  /** The features of the data object. */
  features?: number[];
}

/** The interface of an image data object. */
export interface IImage extends IDataObject {
  /** The storage path of the image on the server. */
  path: string | null;
  /** The width of the image. */
  width?: number | null;
  /** The height of the image. */
  height?: number | null;
}

/** The type of data labels. */
export type Label = string;

/** The interface of the segmentation label of an image data object. */
export interface ILabelMask {
  /** The storage path of the mask on the server. */
  path: string | null;
  /** The color encoding of the stored mask image. */
  colorEncoding?: { [key: string]: number | [number, number, number] } | null;
  /** The width of the mask. */
  width?: number | null;
  /** The height of the mask. */
  height?: number | null;
}

/** The type of data shapes in polygon annotation. */
export enum ObjectShapeType {
  Polygon = 'Polygon',
  Rect = 'Rect',
  Point = 'Point',
}

/** The interface of a polygon annotation in an image data object. */
export interface ILabelGeometricObject {
  label: Label;
  shape: ObjectShapeType;
  position: [number, number][] | [number, number];
  /** The uuid is for recognizing which shape in the canvas
   * corresponds to which label geometric object. */
  uuid?: string | null;
}

/** The type of data label annotations. */
export enum LabelTaskType {
  /** Classification */
  Classification = 'Classification',
  /** Object detection */
  ObjectDetection = 'ObjectDetection',
  /** Segmentation */
  Segmentation = 'Segmentation',
}

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
  content: string;
  type: MessageType;
}

/** The interface of an algorithmic feature extraction method. */
export interface FeatureExtractionMethod {
  name: string;
  serverless: boolean;
  api: string; // for serverless methods, the api is the method's unique name
  parameters: Array<string>;
  isBuiltIn: boolean;
  id: string;
}

/** The enum of data object sampling strategy types. */
export enum SamplingStrategyType {
  Random = 'Random',
  Cluster = 'Cluster',
  DenseAreas = 'DenseAreas',
  ClusterCentroids = 'ClusterCentroids',
  Entropy = 'Entropy',
  EntropyDiversity = 'EntropyDiversity',
  EntropyDiversityDensity = 'EntropyDiversityDensity',
  LeastConfident = 'LeastConfident',
  SmallestMargin = 'SmallestMargin',
}

/** The interface of an algorithmic default labeling method. */
export interface DefaultLabelingMethod {
  name: string;
  serverless: boolean;
  api: string; // for serverless methods, the api is the method's unique name
  parameters: Array<string>;
  isBuiltIn: boolean;
  id: string;
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

/** The enum of task transformation types. */
export enum TaskTransformationType {
  DirectLabeling = 'DirectLabeling',
}

/** The enum of stoppage analysis types. */
export enum StoppageAnalysisType {
  AllChecked = 'AllChecked',
}

/** The enum of interim model training types. */
export enum InterimModelTrainingType {
  Retrain = 'Retrain',
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
  type: DefaultLabelingMethodType;
  /** The data object sampling strategy. */
  samplingStrategy: SamplingStrategyType;
  /** The key to the default labeling model stored in the backend. */
  predictor: string | null;
  /** The key to the sampling model stored in the backend. */
  sampler: string | null;
}

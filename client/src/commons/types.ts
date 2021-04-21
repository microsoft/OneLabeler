/** The types of data objects. */
export enum DataType {
  Image = 'Image',
  Video = 'Video',
  Audio = 'Audio',
  Document = 'Document',
}

/** The types of label tasks. */
export enum LabelTaskType {
  Classification = 'Classification',
  ObjectDetection = 'ObjectDetection',
  Segmentation = 'Segmentation',
}

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

/** The enum of label status types. */
export enum Status {
  /** The data object is not viewed and not labeled. */
  New = 'New',
  /** The data object is viewed but not yet labeled. */
  Viewed = 'Viewed',
  /** The data object is viewed but skipped. */
  Skipped = 'Skipped',
  /** The data object is labeled. */
  Labeled = 'Labeled',
}

export interface ICommand {
  execute: () => void;
  undo: () => void;
}

/** The enum of alert message types. */
export enum MessageType {
  Error = 'Error',
  Success = 'Success',
}

/** The interface of an alert message. */
export interface IMessage {
  content: string;
  type: MessageType;
}

/** The interface of a model service. */
export interface ModelService {
  name: string;
  serverless: boolean;
  type: string,
  isBuiltIn: boolean;
  objectId: string;
  usableAsSampler: boolean;
  // id: string;
  // api: string;
  // isLocal: boolean;
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

/** The interface of a data object selection method. */
export interface DataObjectSelectionMethod {
  name: string;
  serverless: boolean;
  algorithmic: boolean;
  api: string; // for serverless methods, the api is the method's unique name
  parameters: Array<string>;
  isBuiltIn: boolean;
  id: string;
  configuration?: Record<string, any>;
}

/** The interface of an interim model training method. */
export interface InterimModelTrainingMethod {
  name: string;
  serverless: boolean;
  api: string; // for serverless methods, the api is the method's unique name
  parameters: Array<string>;
  isBuiltIn: boolean;
  id: string;
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

/** The interface of an interactive labeling method. */
export interface InteractiveLabelingMethod {
  name: string;
  parameters: Array<string>;
  isBuiltIn: boolean;
  id: string;
  configuration?: Record<string, any>;
}

/** The interface of an interim model training method. */
export interface StoppageAnalysisMethod {
  name: string;
  serverless: boolean;
  api: string; // for serverless methods, the api is the method's unique name
  parameters: Array<string>;
  isBuiltIn: boolean;
  id: string;
}

/** The interface of a task transformation method. */
export interface TaskTransformationMethod {
  name: string;
  parameters: Array<string>;
  isBuiltIn: boolean;
  id: string;
}

/** The enum of projection method types. */
export enum ProjectionMethodType {
  PCA = 'PCA',
  MDS = 'MDS',
  TSNE = 't-SNE',
}

/** The types of data objects. */
export enum DataType {
  Image = 'Image',
  Video = 'Video',
  Audio = 'Audio',
  Text = 'Text',
}

/** The types of label tasks. */
export enum LabelTaskType {
  Classification = 'Classification',
  ObjectDetection = 'ObjectDetection',
  Segmentation = 'Segmentation',
  WordClassification = 'WordClassification',
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
  /** The image content as base64 string. */
  content?: string | null;
  /** The storage path of the image on the server. */
  path?: string | null;
  /** The width of the image. */
  width?: number | null;
  /** The height of the image. */
  height?: number | null;
}

/** The interface of an text data object. */
export interface IText extends IDataObject {
  /** The text content. */
  content: string;
}

/** The label category. */
export type Category = string;

/** The type of data category labels. */
export type ILabelCategory = Category;

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
export interface ILabelShape {
  category: Category;
  shape: ObjectShapeType;
  position: [number, number][] | [number, number];
  /** The uuid is for recognizing which shape in the canvas
   * corresponds to which label shape. */
  uuid?: string | null;
}

export interface ILabel {
  /** The uuid of the data object that owns the label. */
  uuid: string;
  /** Different modalities of label. */
  category?: ILabelCategory;
  mask?: ILabelMask;
  shapes?: ILabelShape[];
}

/** The enum of label status types. */
export enum StatusType {
  /** The data object is not viewed and not labeled. */
  New = 'New',
  /** The data object is viewed but not yet labeled. */
  Viewed = 'Viewed',
  /** The data object is viewed but skipped. */
  Skipped = 'Skipped',
  /** The data object is labeled. */
  Labeled = 'Labeled',
}

export interface IStatus {
  /** The uuid of the data object that owns the label status. */
  uuid: string;
  /** The label status value. */
  value: StatusType;
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

/** The interface of data object storage. */
export interface IDataObjectStorage {
  add(dataObject: IDataObject): Promise<void>;
  count(): Promise<number>;
  deleteAll(): Promise<void>;
  get(uuid: string): Promise<IDataObject | undefined>;
  getAll(): Promise<IDataObject[]>;
  getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]>;
  setBulk(dataObjects: IDataObject[]): Promise<void>;
  shallowCopy(): IDataObjectStorage;
  slice(begin?: number, end?: number): Promise<IDataObject[]>;
  uuids(): Promise<string[]>;
}

/** The interface of label storage. */
export interface ILabelStorage {
  count(condition?: (value: ILabel) => boolean): Promise<number>;
  deleteAll(): Promise<void>;
  get(uuid: string): Promise<ILabel | undefined>;
  getBulk(uuids: string[]): Promise<(ILabel | undefined)[]>;
  getAll(): Promise<ILabel[]>;
  getFiltered(condition: (value: ILabel) => boolean): Promise<ILabel[]>;
  set(label: ILabel): Promise<void>;
  setBulk(labels: ILabel[]): Promise<void>;
  shallowCopy(): ILabelStorage;
}

/** The interface of status storage. */
export interface IStatusStorage {
  count(condition?: (value: IStatus) => boolean): Promise<number>;
  deleteAll(): Promise<void>;
  get(uuid: string): Promise<IStatus | undefined>;
  getBulk(uuids: string[]): Promise<(IStatus | undefined)[]>;
  getAll(): Promise<IStatus[]>;
  set(status: IStatus): Promise<void>;
  setBulk(statuses: IStatus[]): Promise<void>;
  shallowCopy(): IStatusStorage;
}

/** The enum of projection method types. */
export enum ProjectionMethodType {
  PCA = 'PCA',
  MDS = 'MDS',
  TSNE = 't-SNE',
}

/** The interface of a model service. */
export interface ModelService {
  type: string;
  label: string;
  objectId: string;
  isBuiltIn: boolean;
  isServerless: boolean;
  isValidSampler: boolean;
  // id: string;
  // api: string;
  // isLocal: boolean;
}

export type MethodParams = Record<string, {
  value: unknown,
  label: string,
  options: { value: unknown, label: string }[],
}>;

export enum ProcessType {
  LabelIdeation = 'LabelIdeation',
  FeatureExtraction = 'FeatureExtraction',
  DataObjectSelection = 'DataObjectSelection',
  DefaultLabeling = 'DefaultLabeling',
  TaskTransformation = 'TaskTransformation',
  InteractiveLabeling = 'InteractiveLabeling',
  StoppageAnalysis = 'StoppageAnalysis',
  InterimModelTraining = 'InterimModelTraining',
  QualityAssurance = 'QualityAssurance',
}

/** The data labeling process class. */
export interface Process {
  type: ProcessType;
  label: string;
  inputs: string[];
  // For serverless methods, the api is the method's unique key.
  api: string;
  id: string;
  isAlgorithmic: boolean;
  isBuiltIn: boolean;
  isModelBased: boolean;
  isServerless: boolean;
  // The restriction on data types that the process can handle.
  // If not given, the process is regarded agnostic of data types.
  dataTypes?: DataType[];
  model?: ModelService;
  params?: MethodParams;
}

export enum WorkflowNodeType {
  Initialization = 'Initialization',
  LabelIdeation = 'LabelIdeation',
  FeatureExtraction = 'FeatureExtraction',
  DataObjectSelection = 'DataObjectSelection',
  DefaultLabeling = 'DefaultLabeling',
  TaskTransformation = 'TaskTransformation',
  InteractiveLabeling = 'InteractiveLabeling',
  StoppageAnalysis = 'StoppageAnalysis',
  InterimModelTraining = 'InterimModelTraining',
  QualityAssurance = 'QualityAssurance',
  Decision = 'Decision',
  Terminal = 'Terminal',
}

export type InitializationParams = {
  dataType: DataType | null;
  labelTasks: LabelTaskType[];
}

export type WorkflowNode = {
  label: string;
  type: WorkflowNodeType;
  id: string;
  value: Process // for node with a single instantiation
    | Process[] // for node with multiple concurrent instantiations
    | InitializationParams // for initialization node
    | null // for node with a single instantiation not yet chosen
    | undefined; // for decision and terminal nodes
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export enum PortDirection {
  Top = 'Top',
  Left = 'Left',
  Bottom = 'Bottom',
  Right = 'Right',
}

export type WorkflowEdge = {
  source: string;
  target: string;
  id: string;
  condition?: boolean;
  layout: {
    source: {
      direction: PortDirection,
      dx: number;
      dy: number;
    },
    target: {
      direction: PortDirection,
      dx: number;
      dy: number;
    }
  };
}

export type WorkflowGraph = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export type TaskWindow = {
  node: WorkflowNode;
  process: Process;
  isPinned: boolean;
  isMinimized: boolean;
}

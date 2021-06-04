import { FilterQuery } from 'mongoose';
import { VueConstructor } from 'vue';

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
  FreeformText = 'FreeformText',
  ObjectDetection = 'ObjectDetection',
  Segmentation = 'Segmentation',
  SpanClassification = 'SpanClassification',
}

/** The interface of a data object to be labeled. */
export interface IDataObject {
  /** The universal unique id of the data object. */
  uuid: string;
  /** The content of the data object. */
  content?: any;
  /** The storage url of the data object. */
  url?: string | null;
  /** The features of the data object. */
  features?: number[];
}

/** The interface of an image data object. */
export interface IImage extends IDataObject {
  /** The image content as base64 string. */
  content?: string | null;
  /** The width of the image. */
  width?: number | null;
  /** The height of the image. */
  height?: number | null;
}

/** The interface of an text data object. */
export interface IText extends IDataObject {
  /** The text content. */
  content?: string | null;
}

/** The label category. */
export type Category = string;

/** The type of data category labels. */
export type ILabelCategory = Category;

/** The type of data shapes in polygon annotation. */
export enum ObjectShapeType {
  Polygon = 'Polygon',
  Rect = 'Rect',
  Point = 'Point',
}

type Point = [number, number];

/** The interface of a polygon annotation in an image data object. */
export interface ILabelShape {
  category: Category;
  shape: ObjectShapeType;
  position: Point[] | Point;
  /** The uuid is for recognizing which shape in the canvas
   * corresponds to which label shape. */
  uuid?: string | null;
}

/** The interface of the segmentation label of an image data object. */
export interface ILabelMask {
  /** The mask content as base64 string. */
  content: string | null;
  /** The color encoding of the stored mask image. */
  label2color?: { [key: string]: number | [number, number, number] } | null;
  /** The width of the mask. */
  width?: number | null;
  /** The height of the mask. */
  height?: number | null;
}

/** The interface of the named entity label of a text data object. */
export interface ILabelSpan {
  /** The string of the entity. */
  text: string | null;
  /** The index of the entity's first character in the original text. */
  start: number;
  /** The index of the entity's last character in the original text. */
  end: number;
  /** The category of the entity. */
  category: Category;
  /** The uuid for differentiating spans with the same content. */
  uuid: string;
}

/** The interface of the freeform text label of a data object. */
export interface ILabelText {
  /** The text annotation. */
  content: string | null;
}

export interface ILabel {
  /** The uuid of the data object that owns the label. */
  uuid: string;
  /** Different modalities of label. */
  category?: ILabelCategory;
  text?: ILabelText;
  shapes?: ILabelShape[];
  mask?: ILabelMask;
  spans?: ILabelSpan[];
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
  /** Count the number of stored data objects. */
  count(): Promise<number>;
  /** Delete all the data objects. */
  deleteAll(): Promise<void>;
  /** Get a data object by uuid. */
  get(uuid: string): Promise<IDataObject | undefined>;
  /** Get all the data objects. */
  getAll(): Promise<IDataObject[]>;
  /** Get an ordered list of data objects by uuids. */
  getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]>;
  /** Create a copy of the storage object pointing to the same storage. */
  shallowCopy(): IDataObjectStorage;
  /** Create a slice of the data objects by storage index range. */
  slice(begin?: number, end?: number): Promise<IDataObject[]>;
  /** Upsert a data object to the storage. */
  upsert(dataObject: IDataObject): Promise<void>;
  /** Upsert a bulk of data objects to the storage. */
  upsertBulk(dataObjects: IDataObject[]): Promise<void>;
  /** Get the uuids of stored data objects. */
  uuids(): Promise<string[]>;
}

/** The interface of label storage. */
export interface ILabelStorage {
  /** Count the number of stored labels with optional filter. */
  count(query?: FilterQuery<unknown>): Promise<number>;
  /** Delete all the labels. */
  deleteAll(): Promise<void>;
  /** Get a label by uuid. */
  get(uuid: string): Promise<ILabel | undefined>;
  /** Get all the labels. */
  getAll(): Promise<ILabel[]>;
  /** Get an ordered list of labels by uuids. */
  getBulk(uuids: string[]): Promise<(ILabel | undefined)[]>;
  /** Get a list of labels by filter. */
  getFiltered(query: FilterQuery<unknown>): Promise<ILabel[]>;
  /** Create a copy of the storage object pointing to the same storage. */
  shallowCopy(): ILabelStorage;
  /** Upsert a label to the storage. */
  upsert(label: ILabel): Promise<void>;
  /** Upsert a bulk of labels to the storage. */
  upsertBulk(labels: ILabel[]): Promise<void>;
}

/** The interface of status storage. */
export interface IStatusStorage {
  /** Count the number of stored statuses with optional filter. */
  count(query?: FilterQuery<unknown>): Promise<number>;
  /** Delete all the statuses. */
  deleteAll(): Promise<void>;
  /** Get a status by uuid. */
  get(uuid: string): Promise<IStatus | undefined>;
  /** Get all the statuses. */
  getAll(): Promise<IStatus[]>;
  /** Get an ordered list of statuses by uuids. */
  getBulk(uuids: string[]): Promise<(IStatus | undefined)[]>;
  /** Create a copy of the storage object pointing to the same storage. */
  shallowCopy(): IStatusStorage;
  /** Upsert a status to the storage. */
  upsert(status: IStatus): Promise<void>;
  /** Upsert a bulk of statuses to the storage. */
  upsertBulk(statuses: IStatus[]): Promise<void>;
}

/** The interface of merged storage of data object, label, status. */
export interface IStorageStore {
  dataObjects: IDataObjectStorage;
  labels: ILabelStorage;
  statuses: IStatusStorage;
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

export enum SourceType {
  FileUpload = 'FileUpload',
  ServerDB = 'ServerDB',
}

export interface SourceService {
  type: SourceType;
  label: string;
  api: string;
  id: string;
  isBuiltIn: boolean;
  isServerless: boolean;
}

export enum StorageType {
  ClientMemory = 'ClientMemory',
  ClientDB = 'ClientDB',
  ServerDB = 'ServerDB',
}

export interface StorageService {
  type: StorageType;
  label: string;
  api: string;
  id: string;
  isBuiltIn: boolean;
  isServerless: boolean;
}

/** The data type setup abstracting type-dependent properties. */
export interface IDataTypeSetup {
  type: DataType | string;
  tasks: LabelTaskType[];
  label: string;
  handleImport: ((input: FileList, storage: IDataObjectStorage) => void | Promise<void>)
    | ((input: File, storage: IDataObjectStorage) => void | Promise<void>);
  handleExport: (
    dataObjects: IDataObject[],
    labels: ILabel[],
  ) => Record<string, unknown>[];
  display: VueConstructor;
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

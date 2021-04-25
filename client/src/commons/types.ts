import { v4 as uuidv4 } from 'uuid';

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

/** The enum of projection method types. */
export enum ProjectionMethodType {
  PCA = 'PCA',
  MDS = 'MDS',
  TSNE = 't-SNE',
}

/** The interface of a model service. */
export interface ModelService {
  type: string,
  name: string;
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
  title: string,
  options: { value: unknown, text: string }[],
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
export class Process {
  public type: ProcessType | null;

  public name: string;

  public id: string;

  public inputs: Array<string>;

  public isAlgorithmic: boolean;

  public isBuiltIn: boolean;

  public isModelBased: boolean;

  public isServerless: boolean;

  // for serverless methods, the api is the method's unique name
  public api?: string;

  public model?: ModelService;

  public params?: MethodParams;

  constructor({
    type = null,
    name = 'custom',
    id = null,
    inputs = ['labels'],
    isAlgorithmic = true,
    isBuiltIn = false,
    isModelBased = false,
    isServerless = false,
    api = undefined,
    model = undefined,
    params = undefined,
  }: {
    type?: ProcessType | null,
    name?: string;
    id?: string | null;
    inputs?: Array<string>;
    isAlgorithmic?: boolean;
    isBuiltIn?: boolean;
    isModelBased?: boolean;
    isServerless?: boolean;
    api?: string;
    model?: ModelService;
    params?: MethodParams;
  } = {}) {
    this.type = type;
    this.name = name;
    this.id = id === null ? `custom-${uuidv4()}` : id as unknown as string;
    this.inputs = inputs;
    this.isAlgorithmic = isAlgorithmic;
    this.isBuiltIn = isBuiltIn;
    this.isModelBased = isModelBased;
    this.isServerless = isServerless;
    if (api) this.api = api;
    if (model) this.model = model;
    if (params) this.params = params;
  }

  static from(json: unknown): Process {
    return Object.assign(new Process(), json);
  }
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

export type WorkflowNode = {
  id: string;
  title: string;
  type: WorkflowNodeType;
  value?: Process
    | Process[]
    | { dataType: DataType | null, labelTasks: LabelTaskType[] };
  x?: number;
  y?: number;
}

export type WorkflowEdge = {
  source: string;
  target: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  condition?: unknown;
}

export type WorkflowGraph = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

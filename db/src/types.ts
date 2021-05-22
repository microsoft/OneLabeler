import { FilterQuery } from 'mongoose';

/** The interface of a data object to be labeled. */
export interface IDataObject {
  /** The universal unique id of the data object. */
  uuid: string;
  /** The features of the data object. */
  features?: number[];
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
  /** The storage path of the mask on the server. */
  path: string | null;
  /** The color encoding of the stored mask image. */
  label2color?: { [key: string]: number | [number, number, number] } | null;
  /** The width of the mask. */
  width?: number | null;
  /** The height of the mask. */
  height?: number | null;
}

export interface ILabel {
  /** The uuid of the data object that owns the label. */
  uuid: string;
  /** Different modalities of label. */
  category?: ILabelCategory;
  shapes?: ILabelShape[];
  mask?: ILabelMask;
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

/** The interface of data object storage. */
export interface IDataObjectStorage {
  add(dataObject: IDataObject): Promise<void>;
  count(): Promise<number>;
  deleteAll(): Promise<void>;
  get(uuid: string): Promise<IDataObject | undefined>;
  getAll(): Promise<IDataObject[]>;
  getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]>;
  set(dataObject: IDataObject): Promise<void>;
  setBulk(dataObjects: IDataObject[]): Promise<void>;
  shallowCopy(): IDataObjectStorage;
  slice(begin?: number, end?: number): Promise<IDataObject[]>;
  uuids(): Promise<string[]>;
}

/** The interface of label storage. */
export interface ILabelStorage {
  count(query?: FilterQuery<unknown>): Promise<number>;
  deleteAll(): Promise<void>;
  get(uuid: string): Promise<ILabel | undefined>;
  getBulk(uuids: string[]): Promise<(ILabel | undefined)[]>;
  getAll(): Promise<ILabel[]>;
  getFiltered(query: FilterQuery<unknown>): Promise<ILabel[]>;
  set(label: ILabel): Promise<void>;
  setBulk(labels: ILabel[]): Promise<void>;
  shallowCopy(): ILabelStorage;
}

/** The interface of status storage. */
export interface IStatusStorage {
  count(query?: FilterQuery<unknown>): Promise<number>;
  deleteAll(): Promise<void>;
  get(uuid: string): Promise<IStatus | undefined>;
  getBulk(uuids: string[]): Promise<(IStatus | undefined)[]>;
  getAll(): Promise<IStatus[]>;
  set(status: IStatus): Promise<void>;
  setBulk(statuses: IStatus[]): Promise<void>;
  shallowCopy(): IStatusStorage;
}

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

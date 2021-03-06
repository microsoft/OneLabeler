// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { FilterQuery } from 'mongoose';
import type { WorkflowNode } from '@/builtins/workflow-templates/types';
import type { IDataObject } from '@/builtins/data-types/types';
import type { ILabel } from '@/builtins/label-task-types/types';
import type { IModule } from '@/builtins/modules/types';

export * from '@/builtins/data-types/types';
export * from '@/builtins/label-task-types/types';
export * from '@/builtins/modules/types';
export * from '@/builtins/workflow-templates/types';

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

type MaybePromise<T> = T | Promise<T>;

/** The interface of data object storage. */
export interface IDataObjectStorage {
  /** Count the number of stored data objects. */
  count(): MaybePromise<number>;
  /** Delete all the data objects. */
  deleteAll(): MaybePromise<void>;
  /** Get a data object by uuid. */
  get(uuid: string): MaybePromise<IDataObject | undefined>;
  /** Get all the data objects. */
  getAll(): MaybePromise<IDataObject[]>;
  /** Get an ordered list of data objects by uuids. */
  getBulk(uuids: string[]): MaybePromise<(IDataObject | undefined)[]>;
  /** Create a copy of the storage object pointing to the same storage. */
  shallowCopy(): IDataObjectStorage;
  /** Create a slice of the data objects by storage index range. */
  slice(begin?: number, end?: number): MaybePromise<IDataObject[]>;
  /** Upsert a data object to the storage. */
  upsert(dataObject: IDataObject): MaybePromise<void>;
  /** Upsert a bulk of data objects to the storage. */
  upsertBulk(dataObjects: IDataObject[]): MaybePromise<void>;
  /** Get the uuids of stored data objects. */
  uuids(): MaybePromise<string[]>;
}

/** The interface of label storage. */
export interface ILabelStorage {
  /** Count the number of stored labels. */
  count(): MaybePromise<number>;
  /** Count the number of stored labels with filtering by value. */
  countByValue(value: unknown): MaybePromise<number>;
  /** Delete all the labels. */
  deleteAll(): MaybePromise<void>;
  /** Get a label by uuid. */
  get(uuid: string): MaybePromise<ILabel | undefined>;
  /** Get all the labels. */
  getAll(): MaybePromise<ILabel[]>;
  /** Get an ordered list of labels by uuids. */
  getBulk(uuids: string[]): MaybePromise<(ILabel | undefined)[]>;
  /** Get a list of labels by filter. */
  getFiltered(query: FilterQuery<unknown>): MaybePromise<ILabel[]>;
  /** Create a copy of the storage object pointing to the same storage. */
  shallowCopy(): ILabelStorage;
  /** Upsert a label to the storage. */
  upsert(label: ILabel): MaybePromise<void>;
  /** Upsert a bulk of labels to the storage. */
  upsertBulk(labels: ILabel[]): MaybePromise<void>;
}

/** The interface of status storage. */
export interface IStatusStorage {
  /** Count the number of stored statuses. */
  count(): MaybePromise<number>;
  /** Count the number of stored statuses with filtering by value. */
  countByValue(value: unknown): MaybePromise<number>;
  /** Delete all the statuses. */
  deleteAll(): MaybePromise<void>;
  /** Get a status by uuid. */
  get(uuid: string): MaybePromise<IStatus | undefined>;
  /** Get all the statuses. */
  getAll(): MaybePromise<IStatus[]>;
  /** Get an ordered list of statuses by uuids. */
  getBulk(uuids: string[]): MaybePromise<(IStatus | undefined)[]>;
  /** Get a list of statuses by filter. */
  getFiltered(query: FilterQuery<unknown>): MaybePromise<IStatus[]>;
  /** Create a copy of the storage object pointing to the same storage. */
  shallowCopy(): IStatusStorage;
  /** Upsert a status to the storage. */
  upsert(status: IStatus): MaybePromise<void>;
  /** Upsert a bulk of statuses to the storage. */
  upsertBulk(statuses: IStatus[]): MaybePromise<void>;
}

/** The interface of merged storage of data object, label, status. */
export interface IStorageStore {
  dataObjects: IDataObjectStorage;
  labels: ILabelStorage;
  statuses: IStatusStorage;
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

export type TaskWindow = {
  node: WorkflowNode;
  process: IModule;
  isPinned: boolean;
  isMinimized: boolean;
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

/** The enum of workflow panel dock location. */
export enum DockSideType {
  /** Do not show the panel. */
  Hide = 'Hide',
  /** Show as a separate window. */
  Window = 'Window',
  /** Show as full screen. */
  FullScreen = 'FullScreen',
  /** Dock on the left of the created system. */
  Left = 'Left',
  /** Dock on the bottom of the created system. */
  Bottom = 'Bottom',
  /** Dock on the right of the created system. */
  Right = 'Right',
  /** Show as a minimap. */
  Minimap = 'Minimap',
}

import Dexie from 'dexie';
import {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  IStatus,
  IStatusStorage,
} from '@/commons/types';

/* eslint max-classes-per-file: ["error", 4] */

const DB_NAME = 'DataLabelingStorage';

class DataLabelingDB extends Dexie {
  dataObjects: Dexie.Table<IDataObject, string>;

  labels: Dexie.Table<ILabel, string>;

  statuses: Dexie.Table<IStatus, string>;

  constructor() {
    super(DB_NAME);
    this.version(1).stores({
      dataObjects: 'uuid',
      labels: 'uuid',
      statuses: 'uuid',
    });
    this.dataObjects = this.table('dataObjects');
    this.labels = this.table('labels');
    this.statuses = this.table('statuses');
  }
}

class DataObjectDB implements IDataObjectStorage {
  #storage: Dexie.Table<IDataObject, string>;

  constructor(dataObjects: Dexie.Table<IDataObject, string>) {
    this.#storage = dataObjects;
  }

  // Add one data object.
  async add(dataObject: IDataObject): Promise<void> {
    await this.#storage.add(dataObject);
  }

  // Count the number of data objects.
  count(): Promise<number> {
    return this.#storage.count();
  }

  // Delete all the data objects.
  async deleteAll(): Promise<void> {
    await this.#storage.clear();
  }

  // Retrieve a data object by uuid.
  get(uuid: string): Promise<IDataObject | undefined> {
    return this.#storage.get(uuid);
  }

  // Retrieve a list of data objects by uuids.
  getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]> {
    return this.#storage.bulkGet(uuids);
  }

  // Retrieve all the data objects.
  getAll(): Promise<IDataObject[]> {
    return this.#storage.toArray();
  }

  // Set the data objects.
  async setBulk(dataObjects: IDataObject[]): Promise<void> {
    await this.#storage.bulkPut(dataObjects);
  }

  shallowCopy(): IDataObjectStorage {
    return new DataObjectDB(this.#storage);
  }

  slice(begin?: number, end?: number): Promise<IDataObject[]> {
    if (begin !== undefined && end !== undefined) {
      const n = end - begin;
      return this.#storage.offset(begin).limit(n).toArray();
    }
    if (begin !== undefined && end === undefined) {
      return this.#storage.offset(begin).toArray();
    }
    if (begin === undefined && end !== undefined) {
      return this.#storage.limit(end).toArray();
    }
    return this.#storage.toArray();
  }

  uuids(): Promise<string[]> {
    return this.#storage.toCollection().primaryKeys();
  }
}

class LabelDB implements ILabelStorage {
  #storage: Dexie.Table<ILabel, string>;

  constructor(labels: Dexie.Table<ILabel, string>) {
    this.#storage = labels;
  }

  // Count the number of labels.
  count(condition?: (value: ILabel) => boolean): Promise<number> {
    if (condition === undefined) {
      return this.#storage.count();
    }
    return this.#storage.filter(condition).count();
  }

  // Delete all the labels.
  async deleteAll(): Promise<void> {
    await this.#storage.clear();
  }

  // Retrieve a label by uuid.
  get(uuid: string): Promise<ILabel | undefined> {
    return this.#storage.get(uuid);
  }

  // Retrieve a list of labels by uuids.
  getBulk(uuids: string[]): Promise<(ILabel | undefined)[]> {
    return this.#storage.bulkGet(uuids);
  }

  // Retrieve all the labels.
  getAll(): Promise<ILabel[]> {
    return this.#storage.toArray();
  }

  // Set the label.
  async set(label: ILabel): Promise<void> {
    await this.#storage.put(label);
  }

  // Set the labels.
  async setBulk(labels: ILabel[]): Promise<void> {
    await this.#storage.bulkPut(labels);
  }

  shallowCopy(): ILabelStorage {
    return new LabelDB(this.#storage);
  }
}

class StatusDB implements IStatusStorage {
  #storage: Dexie.Table<IStatus, string>;

  constructor(statuses: Dexie.Table<IStatus, string>) {
    this.#storage = statuses;
  }

  // Count the number of statuses.
  count(condition?: (value: IStatus) => boolean): Promise<number> {
    if (condition === undefined) {
      return this.#storage.count();
    }
    return this.#storage.filter(condition).count();
  }

  // Delete all the statuses.
  async deleteAll(): Promise<void> {
    await this.#storage.clear();
  }

  // Retrieve a status by uuid.
  get(uuid: string): Promise<IStatus | undefined> {
    return this.#storage.get(uuid);
  }

  // Retrieve a list of statuses by uuids.
  getBulk(uuids: string[]): Promise<(IStatus | undefined)[]> {
    return this.#storage.bulkGet(uuids);
  }

  // Retrieve all the statuses.
  getAll(): Promise<IStatus[]> {
    return this.#storage.toArray();
  }

  // Set the status.
  async set(status: IStatus): Promise<void> {
    await this.#storage.put(status);
  }

  // Set the statuses.
  async setBulk(statuses: IStatus[]): Promise<void> {
    await this.#storage.bulkPut(statuses);
  }

  shallowCopy(): IStatusStorage {
    return new StatusDB(this.#storage);
  }
}

const DB = new DataLabelingDB();
export const dataObjectDB = new DataObjectDB(DB.dataObjects);
export const labelDB = new LabelDB(DB.labels);
export const statusDB = new StatusDB(DB.statuses);

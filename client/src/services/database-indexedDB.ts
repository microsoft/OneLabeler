import Dexie from 'dexie';
import { FilterQuery } from 'mongoose';
import sift from 'sift';
import {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  IStatus,
  IStatusStorage,
} from '@/commons/types';
import { randomChoice } from '@/plugins/random';

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

  constructor(storage: Dexie.Table<IDataObject, string>) {
    this.#storage = storage;
  }

  // Add one data object.
  async add(value: IDataObject): Promise<void> {
    await this.#storage.add(value);
  }

  // Count the number of data objects.
  async count(): Promise<number> {
    return this.#storage.count();
  }

  // Delete all the data objects.
  async deleteAll(): Promise<void> {
    await this.#storage.clear();
  }

  // Retrieve a data object by uuid.
  async get(uuid: string): Promise<IDataObject | undefined> {
    return this.#storage.get(uuid);
  }

  // Retrieve a list of data objects by uuids.
  async getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]> {
    return this.#storage.bulkGet(uuids);
  }

  // Retrieve all the data objects.
  async getAll(): Promise<IDataObject[]> {
    return this.#storage.toArray();
  }

  async randomChoice(
    size: number,
    random: () => number = Math.random,
  ): Promise<IDataObject[]> {
    // TODO: replace the random selection algorithm to improve time/space complexity
    // The current implementation has space complexity O(nDataObjects)
    // and time complexity O(nDataObjects).
    const n = await this.count();
    const range = [...Array(n).keys()];
    const selection = randomChoice(range, size, random);
    const samples = await Promise.all(selection.map(
      (idx) => this.#storage.offset(idx).first(),
    )) as IDataObject[];
    return samples;
  }

  async set(value: IDataObject): Promise<void> {
    await this.#storage.put(value);
  }

  // Set the data objects.
  async setBulk(values: IDataObject[]): Promise<void> {
    await this.#storage.bulkPut(values);
  }

  shallowCopy(): IDataObjectStorage {
    return new DataObjectDB(this.#storage);
  }

  async slice(begin?: number, end?: number): Promise<IDataObject[]> {
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

  async uuids(): Promise<string[]> {
    return this.#storage.toCollection().primaryKeys();
  }
}

class LabelDB implements ILabelStorage {
  #storage: Dexie.Table<ILabel, string>;

  constructor(storage: Dexie.Table<ILabel, string>) {
    this.#storage = storage;
  }

  // Count the number of labels.
  async count(query?: FilterQuery<unknown>): Promise<number> {
    if (query === undefined) {
      return this.#storage.count();
    }
    const filter: ((item: unknown) => boolean) = sift(query);
    return this.#storage.filter(filter).count();
  }

  // Delete all the labels.
  async deleteAll(): Promise<void> {
    await this.#storage.clear();
  }

  // Retrieve a label by uuid.
  async get(uuid: string): Promise<ILabel | undefined> {
    return this.#storage.get(uuid);
  }

  // Retrieve a list of labels by uuids.
  async getBulk(uuids: string[]): Promise<(ILabel | undefined)[]> {
    return this.#storage.bulkGet(uuids);
  }

  // Retrieve all the labels.
  async getAll(): Promise<ILabel[]> {
    return this.#storage.toArray();
  }

  // Retrieve a list of labels by filter.
  async getFiltered(query: FilterQuery<unknown>): Promise<ILabel[]> {
    const filter: ((item: unknown) => boolean) = sift(query);
    return this.#storage.filter(filter).toArray();
  }

  // Set the label.
  async set(value: ILabel): Promise<void> {
    await this.#storage.put(value);
  }

  // Set the labels.
  async setBulk(values: ILabel[]): Promise<void> {
    await this.#storage.bulkPut(values);
  }

  shallowCopy(): ILabelStorage {
    return new LabelDB(this.#storage);
  }
}

class StatusDB implements IStatusStorage {
  #storage: Dexie.Table<IStatus, string>;

  constructor(storage: Dexie.Table<IStatus, string>) {
    this.#storage = storage;
  }

  // Count the number of statuses.
  async count(query?: FilterQuery<unknown>): Promise<number> {
    if (query === undefined) {
      return this.#storage.count();
    }
    const filter: ((item: unknown) => boolean) = sift(query);
    return this.#storage.filter(filter).count();
  }

  // Delete all the statuses.
  async deleteAll(): Promise<void> {
    await this.#storage.clear();
  }

  // Retrieve a status by uuid.
  async get(uuid: string): Promise<IStatus | undefined> {
    return this.#storage.get(uuid);
  }

  // Retrieve a list of statuses by uuids.
  async getBulk(uuids: string[]): Promise<(IStatus | undefined)[]> {
    return this.#storage.bulkGet(uuids);
  }

  // Retrieve all the statuses.
  async getAll(): Promise<IStatus[]> {
    return this.#storage.toArray();
  }

  // Set the status.
  async set(value: IStatus): Promise<void> {
    await this.#storage.put(value);
  }

  // Set the statuses.
  async setBulk(values: IStatus[]): Promise<void> {
    await this.#storage.bulkPut(values);
  }

  shallowCopy(): IStatusStorage {
    return new StatusDB(this.#storage);
  }
}

const DB = new DataLabelingDB();
export const dataObjectDB = new DataObjectDB(DB.dataObjects);
export const labelDB = new LabelDB(DB.labels);
export const statusDB = new StatusDB(DB.statuses);

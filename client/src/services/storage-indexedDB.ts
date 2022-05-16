// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Dexie from 'dexie';
import sift from 'sift';
import type { Query } from 'sift';
import type {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  IStatus,
  IStatusStorage,
  IStorageStore,
} from '@/commons/types';
import { randomChoice } from '@/plugins/random';

/* eslint max-classes-per-file: ["error", 5] */

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

class DataObjectStorage implements IDataObjectStorage {
  #storage: Dexie.Table<IDataObject, string>;

  constructor(storage: Dexie.Table<IDataObject, string>) {
    this.#storage = storage;
  }

  async count(): Promise<number> {
    return this.#storage.count();
  }

  async deleteAll(): Promise<void> {
    await this.#storage.clear();
  }

  async get(uuid: string): Promise<IDataObject | undefined> {
    return this.#storage.get(uuid);
  }

  async getAll(): Promise<IDataObject[]> {
    return this.#storage.toArray();
  }

  async getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]> {
    return this.#storage.bulkGet(uuids);
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

  shallowCopy(): IDataObjectStorage {
    return new DataObjectStorage(this.#storage);
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

  async upsert(value: IDataObject): Promise<void> {
    await this.#storage.put(value);
  }

  async upsertBulk(values: IDataObject[]): Promise<void> {
    await this.#storage.bulkPut(values);
  }

  async uuids(): Promise<string[]> {
    return this.#storage.toCollection().primaryKeys();
  }
}

class LabelStorage implements ILabelStorage {
  #storage: Dexie.Table<ILabel, string>;

  constructor(storage: Dexie.Table<ILabel, string>) {
    this.#storage = storage;
  }

  async count(): Promise<number> {
    return this.#storage.count();
  }

  async countByValue(value: unknown): Promise<number> {
    const filter = (item: ILabel) => item.value === value;
    return this.#storage.filter(filter).count();
  }

  async deleteAll(): Promise<void> {
    await this.#storage.clear();
  }

  async get(uuid: string): Promise<ILabel | undefined> {
    return this.#storage.get(uuid);
  }

  async getAll(): Promise<ILabel[]> {
    return this.#storage.toArray();
  }

  async getBulk(uuids: string[]): Promise<(ILabel | undefined)[]> {
    return this.#storage.bulkGet(uuids);
  }

  async getFiltered(query: Query<unknown>): Promise<ILabel[]> {
    const filter: ((item: unknown) => boolean) = sift(query);
    return this.#storage.filter(filter).toArray();
  }

  shallowCopy(): ILabelStorage {
    return new LabelStorage(this.#storage);
  }

  async upsert(value: ILabel): Promise<void> {
    await this.#storage.put(value);
  }

  async upsertBulk(values: ILabel[]): Promise<void> {
    await this.#storage.bulkPut(values);
  }
}

class StatusStorage implements IStatusStorage {
  #storage: Dexie.Table<IStatus, string>;

  constructor(storage: Dexie.Table<IStatus, string>) {
    this.#storage = storage;
  }

  async count(): Promise<number> {
    return this.#storage.count();
  }

  async countByValue(value: unknown): Promise<number> {
    const filter = (item: IStatus) => item.value === value;
    return this.#storage.filter(filter).count();
  }

  async deleteAll(): Promise<void> {
    await this.#storage.clear();
  }

  async get(uuid: string): Promise<IStatus | undefined> {
    return this.#storage.get(uuid);
  }

  async getAll(): Promise<IStatus[]> {
    return this.#storage.toArray();
  }

  async getBulk(uuids: string[]): Promise<(IStatus | undefined)[]> {
    return this.#storage.bulkGet(uuids);
  }

  async getFiltered(query: Query<unknown>): Promise<IStatus[]> {
    const filter: ((item: unknown) => boolean) = sift(query);
    return this.#storage.filter(filter).toArray();
  }

  shallowCopy(): IStatusStorage {
    return new StatusStorage(this.#storage);
  }

  async upsert(value: IStatus): Promise<void> {
    await this.#storage.put(value);
  }

  async upsertBulk(values: IStatus[]): Promise<void> {
    await this.#storage.bulkPut(values);
  }
}

class StorageStore implements IStorageStore {
  dataObjects: IDataObjectStorage;

  labels: ILabelStorage;

  statuses: IStatusStorage;

  constructor() {
    const db = new DataLabelingDB();
    this.dataObjects = new DataObjectStorage(db.dataObjects);
    this.labels = new LabelStorage(db.labels);
    this.statuses = new StatusStorage(db.statuses);
  }
}

export default StorageStore;

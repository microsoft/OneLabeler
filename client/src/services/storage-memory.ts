import { FilterQuery } from 'mongoose';
import sift from 'sift';
import {
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

class DataLabelingMemory {
  dataObjects: Record<string, IDataObject>;

  labels: Record<string, ILabel>;

  statuses: Record<string, IStatus>;

  constructor() {
    this.dataObjects = {};
    this.labels = {};
    this.statuses = {};
  }
}

class DataObjectStorage implements IDataObjectStorage {
  #storage: Record<string, IDataObject>;

  constructor(storage: Record<string, IDataObject>) {
    this.#storage = storage;
  }

  async count(): Promise<number> {
    return Object.keys(this.#storage).length;
  }

  async deleteAll(): Promise<void> {
    this.#storage = {};
  }

  async get(uuid: string): Promise<IDataObject | undefined> {
    return this.#storage[uuid];
  }

  async getAll(): Promise<IDataObject[]> {
    return Object.values(this.#storage);
  }

  async getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]> {
    return uuids.map((d) => this.#storage[d]);
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
    const uuids = await this.uuids();
    const samples = await Promise.all(selection.map(
      (idx) => this.#storage[uuids[idx]],
    )) as IDataObject[];
    return samples;
  }

  shallowCopy(): IDataObjectStorage {
    return new DataObjectStorage(this.#storage);
  }

  async slice(begin?: number, end?: number): Promise<IDataObject[]> {
    const uuids = await this.uuids();
    if (begin !== undefined && end !== undefined) {
      return this.getBulk(uuids.slice(begin, end)) as Promise<IDataObject[]>;
    }
    if (begin !== undefined && end === undefined) {
      return this.getBulk(uuids.slice(begin)) as Promise<IDataObject[]>;
    }
    if (begin === undefined && end !== undefined) {
      return this.getBulk(uuids.slice(undefined, end)) as Promise<IDataObject[]>;
    }
    return Object.values(this.#storage);
  }

  async upsert(value: IDataObject): Promise<void> {
    this.#storage[value.uuid] = value;
  }

  async upsertBulk(values: IDataObject[]): Promise<void> {
    values.forEach((value) => {
      this.#storage[value.uuid] = value;
    });
  }

  async uuids(): Promise<string[]> {
    return Object.keys(this.#storage);
  }
}

class LabelStorage implements ILabelStorage {
  #storage: Record<string, ILabel>;

  constructor(storage: Record<string, ILabel>) {
    this.#storage = storage;
  }

  async count(query?: FilterQuery<unknown>): Promise<number> {
    if (query === undefined) {
      return Object.keys(this.#storage).length;
    }
    const filter: ((item: unknown) => boolean) = sift(query);
    return Object.values(this.#storage).filter(filter).length;
  }

  async deleteAll(): Promise<void> {
    this.#storage = {};
  }

  async get(uuid: string): Promise<ILabel | undefined> {
    return this.#storage[uuid];
  }

  async getAll(): Promise<ILabel[]> {
    return Object.values(this.#storage);
  }

  async getBulk(uuids: string[]): Promise<(ILabel | undefined)[]> {
    return uuids.map((d) => this.#storage[d]);
  }

  async getFiltered(query: FilterQuery<unknown>): Promise<ILabel[]> {
    const filter: ((item: unknown) => boolean) = sift(query);
    return Object.values(this.#storage).filter(filter);
  }

  shallowCopy(): ILabelStorage {
    return new LabelStorage(this.#storage);
  }

  async upsert(value: ILabel): Promise<void> {
    this.#storage[value.uuid] = value;
  }

  async upsertBulk(values: ILabel[]): Promise<void> {
    values.forEach((value) => {
      this.#storage[value.uuid] = value;
    });
  }
}

class StatusStorage implements IStatusStorage {
  #storage: Record<string, IStatus>;

  constructor(storage: Record<string, IStatus>) {
    this.#storage = storage;
  }

  async count(query?: FilterQuery<unknown>): Promise<number> {
    if (query === undefined) {
      return Object.keys(this.#storage).length;
    }
    const filter: ((item: unknown) => boolean) = sift(query);
    return Object.values(this.#storage).filter(filter).length;
  }

  async deleteAll(): Promise<void> {
    this.#storage = {};
  }

  async get(uuid: string): Promise<IStatus | undefined> {
    return this.#storage[uuid];
  }

  async getAll(): Promise<IStatus[]> {
    return Object.values(this.#storage);
  }

  async getBulk(uuids: string[]): Promise<(IStatus | undefined)[]> {
    return uuids.map((d) => this.#storage[d]);
  }

  shallowCopy(): IStatusStorage {
    return new StatusStorage(this.#storage);
  }

  async upsert(value: IStatus): Promise<void> {
    this.#storage[value.uuid] = value;
  }

  async upsertBulk(values: IStatus[]): Promise<void> {
    values.forEach((value) => {
      this.#storage[value.uuid] = value;
    });
  }
}

class StorageStore implements IStorageStore {
  dataObjects: IDataObjectStorage;

  labels: ILabelStorage;

  statuses: IStatusStorage;

  constructor() {
    const memory = new DataLabelingMemory();
    this.dataObjects = new DataObjectStorage(memory.dataObjects);
    this.labels = new LabelStorage(memory.labels);
    this.statuses = new StatusStorage(memory.statuses);
  }
}

export default StorageStore;

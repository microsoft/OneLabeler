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

  // Add one data object.
  async add(value: IDataObject): Promise<void> {
    this.#storage[value.uuid] = value;
  }

  // Count the number of data objects.
  async count(): Promise<number> {
    return Object.keys(this.#storage).length;
  }

  // Delete all the data objects.
  async deleteAll(): Promise<void> {
    this.#storage = {};
  }

  // Retrieve a data object by uuid.
  async get(uuid: string): Promise<IDataObject | undefined> {
    return this.#storage[uuid];
  }

  // Retrieve a list of data objects by uuids.
  async getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]> {
    return uuids.map((d) => this.#storage[d]);
  }

  // Retrieve all the data objects.
  async getAll(): Promise<IDataObject[]> {
    return Object.values(this.#storage);
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

  async set(value: IDataObject): Promise<void> {
    this.#storage[value.uuid] = value;
  }

  // Set the data objects.
  async setBulk(values: IDataObject[]): Promise<void> {
    values.forEach((value) => {
      this.#storage[value.uuid] = value;
    });
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

  async uuids(): Promise<string[]> {
    return Object.keys(this.#storage);
  }
}

class LabelStorage implements ILabelStorage {
  #storage: Record<string, ILabel>;

  constructor(storage: Record<string, ILabel>) {
    this.#storage = storage;
  }

  // Count the number of labels.
  async count(query?: FilterQuery<unknown>): Promise<number> {
    if (query === undefined) {
      return Object.keys(this.#storage).length;
    }
    const filter: ((item: unknown) => boolean) = sift(query);
    return Object.values(this.#storage).filter(filter).length;
  }

  // Delete all the labels.
  async deleteAll(): Promise<void> {
    this.#storage = {};
  }

  // Retrieve a label by uuid.
  async get(uuid: string): Promise<ILabel | undefined> {
    return this.#storage[uuid];
  }

  // Retrieve a list of labels by uuids.
  async getBulk(uuids: string[]): Promise<(ILabel | undefined)[]> {
    return uuids.map((d) => this.#storage[d]);
  }

  // Retrieve all the labels.
  async getAll(): Promise<ILabel[]> {
    return Object.values(this.#storage);
  }

  // Retrieve a list of labels by filter.
  async getFiltered(query: FilterQuery<unknown>): Promise<ILabel[]> {
    const filter: ((item: unknown) => boolean) = sift(query);
    return Object.values(this.#storage).filter(filter);
  }

  // Set the label.
  async set(value: ILabel): Promise<void> {
    this.#storage[value.uuid] = value;
  }

  // Set the labels.
  async setBulk(values: ILabel[]): Promise<void> {
    values.forEach((value) => {
      this.#storage[value.uuid] = value;
    });
  }

  shallowCopy(): ILabelStorage {
    return new LabelStorage(this.#storage);
  }
}

class StatusStorage implements IStatusStorage {
  #storage: Record<string, IStatus>;

  constructor(storage: Record<string, IStatus>) {
    this.#storage = storage;
  }

  // Count the number of statuses.
  async count(query?: FilterQuery<unknown>): Promise<number> {
    if (query === undefined) {
      return Object.keys(this.#storage).length;
    }
    const filter: ((item: unknown) => boolean) = sift(query);
    return Object.values(this.#storage).filter(filter).length;
  }

  // Delete all the statuses.
  async deleteAll(): Promise<void> {
    this.#storage = {};
  }

  // Retrieve a status by uuid.
  async get(uuid: string): Promise<IStatus | undefined> {
    return this.#storage[uuid];
  }

  // Retrieve a list of statuses by uuids.
  async getBulk(uuids: string[]): Promise<(IStatus | undefined)[]> {
    return uuids.map((d) => this.#storage[d]);
  }

  // Retrieve all the statuses.
  async getAll(): Promise<IStatus[]> {
    return Object.values(this.#storage);
  }

  // Set the status.
  async set(value: IStatus): Promise<void> {
    this.#storage[value.uuid] = value;
  }

  // Set the statuses.
  async setBulk(values: IStatus[]): Promise<void> {
    values.forEach((value) => {
      this.#storage[value.uuid] = value;
    });
  }

  shallowCopy(): IStatusStorage {
    return new StatusStorage(this.#storage);
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

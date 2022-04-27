// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { FilterQuery } from 'mongoose';
import sift from 'sift';
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

  count(): number {
    return Object.keys(this.#storage).length;
  }

  deleteAll(): void {
    this.#storage = {};
  }

  get(uuid: string): IDataObject | undefined {
    return this.#storage[uuid];
  }

  getAll(): IDataObject[] {
    return Object.values(this.#storage);
  }

  getBulk(uuids: string[]): (IDataObject | undefined)[] {
    return uuids.map((d) => this.#storage[d]);
  }

  randomChoice(
    size: number,
    random: () => number = Math.random,
  ): IDataObject[] {
    // TODO: replace the random selection algorithm to improve time/space complexity
    // The current implementation has space complexity O(nDataObjects)
    // and time complexity O(nDataObjects).
    const n = this.count();
    const range = [...Array(n).keys()];
    const selection = randomChoice(range, size, random);
    const uuids = this.uuids();
    const samples = selection.map(
      (idx) => this.#storage[uuids[idx]],
    );
    return samples;
  }

  shallowCopy(): IDataObjectStorage {
    return new DataObjectStorage(this.#storage);
  }

  slice(begin?: number, end?: number): IDataObject[] {
    const uuids = this.uuids();
    if (begin !== undefined && end !== undefined) {
      return this.getBulk(uuids.slice(begin, end)) as IDataObject[];
    }
    if (begin !== undefined && end === undefined) {
      return this.getBulk(uuids.slice(begin)) as IDataObject[];
    }
    if (begin === undefined && end !== undefined) {
      return this.getBulk(uuids.slice(undefined, end)) as IDataObject[];
    }
    return Object.values(this.#storage);
  }

  upsert(value: IDataObject): void {
    this.#storage[value.uuid] = value;
  }

  upsertBulk(values: IDataObject[]): void {
    values.forEach((value) => {
      this.#storage[value.uuid] = value;
    });
  }

  uuids(): string[] {
    return Object.keys(this.#storage);
  }
}

class LabelStorage implements ILabelStorage {
  #storage: Record<string, ILabel>;

  constructor(storage: Record<string, ILabel>) {
    this.#storage = storage;
  }

  count(): number {
    return Object.keys(this.#storage).length;
  }

  countByValue(value: unknown): number {
    const filter = (item: ILabel) => item.value === value;
    return Object.values(this.#storage).filter(filter).length;
  }

  deleteAll(): void {
    this.#storage = {};
  }

  get(uuid: string): ILabel | undefined {
    return this.#storage[uuid];
  }

  getAll(): ILabel[] {
    return Object.values(this.#storage);
  }

  getBulk(uuids: string[]): (ILabel | undefined)[] {
    return uuids.map((d) => this.#storage[d]);
  }

  getFiltered(query: FilterQuery<unknown>): ILabel[] {
    const filter: ((item: unknown) => boolean) = sift(query);
    return Object.values(this.#storage).filter(filter);
  }

  shallowCopy(): ILabelStorage {
    return new LabelStorage(this.#storage);
  }

  upsert(value: ILabel): void {
    this.#storage[value.uuid] = value;
  }

  upsertBulk(values: ILabel[]): void {
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

  count(): number {
    return Object.keys(this.#storage).length;
  }

  countByValue(value: unknown): number {
    const filter = (item: IStatus) => item.value === value;
    return Object.values(this.#storage).filter(filter).length;
  }

  deleteAll(): void {
    this.#storage = {};
  }

  get(uuid: string): IStatus | undefined {
    return this.#storage[uuid];
  }

  getAll(): IStatus[] {
    return Object.values(this.#storage);
  }

  getBulk(uuids: string[]): (IStatus | undefined)[] {
    return uuids.map((d) => this.#storage[d]);
  }

  getFiltered(query: FilterQuery<unknown>): IStatus[] {
    const filter: ((item: unknown) => boolean) = sift(query);
    return Object.values(this.#storage).filter(filter);
  }

  shallowCopy(): IStatusStorage {
    return new StatusStorage(this.#storage);
  }

  upsert(value: IStatus): void {
    this.#storage[value.uuid] = value;
  }

  upsertBulk(values: IStatus[]): void {
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

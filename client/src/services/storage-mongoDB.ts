// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
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

/* eslint max-classes-per-file: ["error", 4] */

const SECRETE = 'UKBumAJziW5eL8t';

const path = (
  url: string,
  table: string,
  op: string,
) => `${url}/${table}/${op}`;

class DataObjectStorage implements IDataObjectStorage {
  #url: string;

  #path: (op: string) => string;

  constructor(url: string) {
    this.#url = url;
    this.#path = (op: string) => path(this.#url, 'dataObjects', `${op}?auth=${SECRETE}`);
  }

  async count(): Promise<number> {
    return (await axios.post(this.#path('count'))).data as number;
  }

  async deleteAll(): Promise<void> {
    await axios.post(this.#path('deleteAll'));
  }

  async get(uuid: string): Promise<IDataObject | undefined> {
    const value: IDataObject | null = (await axios.post(
      this.#path('get'),
      { uuid },
    )).data as IDataObject | null;
    return value ?? undefined;
  }

  async getAll(): Promise<IDataObject[]> {
    return (await axios.post(this.#path('getAll'))).data as IDataObject[];
  }

  async getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]> {
    const values: (IDataObject | null)[] = (await axios.post(
      this.#path('getBulk'),
      { uuids },
    )).data as (IDataObject | null)[];
    return values.map((d) => (d ?? undefined));
  }

  shallowCopy(): IDataObjectStorage {
    return new DataObjectStorage(this.#url);
  }

  async slice(begin?: number, end?: number): Promise<IDataObject[]> {
    return (await axios.post(this.#path('slice'), { begin, end })).data as IDataObject[];
  }

  async upsert(value: IDataObject): Promise<void> {
    await axios.post(this.#path('upsert'), { value });
  }

  async upsertBulk(values: IDataObject[]): Promise<void> {
    await axios.post(this.#path('upsertBulk'), { values });
  }

  async uuids(): Promise<string[]> {
    return (await axios.post(this.#path('uuids'))).data as string[];
  }
}

class LabelStorage implements ILabelStorage {
  #url: string;

  #path: (op: string) => string;

  constructor(url: string) {
    this.#url = url;
    this.#path = (op: string) => path(this.#url, 'labels', `${op}?auth=${SECRETE}`);
  }

  async count(): Promise<number> {
    return (await axios.post(this.#path('count'))).data as number;
  }

  async countByValue(value: unknown): Promise<number> {
    return (await axios.post(this.#path('countByValue'), { value })).data as number;
  }

  async deleteAll(): Promise<void> {
    await axios.post(this.#path('deleteAll'));
  }

  async get(uuid: string): Promise<ILabel | undefined> {
    const value: ILabel | null = (await axios.post(
      this.#path('get'),
      { uuid },
    )).data as ILabel | null;
    return value ?? undefined;
  }

  async getAll(): Promise<ILabel[]> {
    return (await axios.post(this.#path('getAll'))).data as ILabel[];
  }

  async getBulk(uuids: string[]): Promise<(ILabel | undefined)[]> {
    const values: (ILabel | null)[] = (await axios.post(
      this.#path('getBulk'),
      { uuids },
    )).data as (ILabel | null)[];
    return values.map((d) => (d ?? undefined));
  }

  async getFiltered(query: Query<unknown>): Promise<ILabel[]> {
    return (await axios.post(this.#path('getFiltered'), { query })).data as ILabel[];
  }

  shallowCopy(): ILabelStorage {
    return new LabelStorage(this.#url);
  }

  async upsert(value: ILabel): Promise<void> {
    await axios.post(this.#path('upsert'), { value });
  }

  async upsertBulk(values: ILabel[]): Promise<void> {
    await axios.post(this.#path('upsertBulk'), { values });
  }
}

class StatusStorage implements IStatusStorage {
  #url: string;

  #path: (op: string) => string;

  constructor(url: string) {
    this.#url = url;
    this.#path = (op: string) => path(this.#url, 'statuses', `${op}?auth=${SECRETE}`);
  }

  async count(): Promise<number> {
    return (await axios.post(this.#path('count'))).data as number;
  }

  async countByValue(value: unknown): Promise<number> {
    return (await axios.post(this.#path('countByValue'), { value })).data as number;
  }

  async deleteAll(): Promise<void> {
    await axios.post(this.#path('deleteAll'));
  }

  async get(uuid: string): Promise<IStatus | undefined> {
    const value: IStatus | null = (await axios.post(
      this.#path('get'),
      { uuid },
    )).data as IStatus | null;
    return value ?? undefined;
  }

  async getAll(): Promise<IStatus[]> {
    return (await axios.post(this.#path('getAll'))).data as IStatus[];
  }

  async getBulk(uuids: string[]): Promise<(IStatus | undefined)[]> {
    const values: (IStatus | null)[] = (await axios.post(
      this.#path('getBulk'),
      { uuids },
    )).data as (IStatus | null)[];
    return values.map((d) => (d === null ? undefined : d));
  }

  async getFiltered(query: Query<unknown>): Promise<IStatus[]> {
    return (await axios.post(this.#path('getFiltered'), { query })).data as IStatus[];
  }

  shallowCopy(): IStatusStorage {
    return new StatusStorage(this.#url);
  }

  async upsert(value: IStatus): Promise<void> {
    await axios.post(this.#path('upsert'), { value });
  }

  async upsertBulk(values: IStatus[]): Promise<void> {
    await axios.post(this.#path('upsertBulk'), { values });
  }
}

class StorageStore implements IStorageStore {
  dataObjects: IDataObjectStorage;

  labels: ILabelStorage;

  statuses: IStatusStorage;

  constructor(url: string) {
    this.dataObjects = new DataObjectStorage(url);
    this.labels = new LabelStorage(url);
    this.statuses = new StatusStorage(url);
  }
}

export default StorageStore;

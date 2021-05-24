import axios from 'axios';
import { FilterQuery } from 'mongoose';
import {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  IStatus,
  IStatusStorage,
  IStorageStore,
} from '@/commons/types';

/* eslint max-classes-per-file: ["error", 4] */

const path = (
  url: string,
  table: string,
  op: string,
) => `${url}/${table}/${op}`;

class DataObjectStorage implements IDataObjectStorage {
  #url: string;

  constructor(url: string) {
    this.#url = url;
  }

  // Add one data object.
  async add(value: IDataObject): Promise<void> {
    await axios.post(path(this.#url, 'dataObjects', 'add'), { value });
  }

  // Count the number of data objects.
  async count(): Promise<number> {
    return (await axios.post(path(this.#url, 'dataObjects', 'count'))).data;
  }

  // Delete all the data objects.
  async deleteAll(): Promise<void> {
    await axios.post(path(this.#url, 'dataObjects', 'deleteAll'));
  }

  // Retrieve a data object by uuid.
  async get(uuid: string): Promise<IDataObject | undefined> {
    const value: IDataObject | null = (await axios.post(
      path(this.#url, 'dataObjects', 'get'),
      { uuid },
    )).data;
    return value === null ? undefined : value;
  }

  // Retrieve a list of data objects by uuids.
  async getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]> {
    const values: (IDataObject | null)[] = (await axios.post(
      path(this.#url, 'dataObjects', 'getBulk'),
      { uuids },
    )).data;
    return values.map((d) => (d === null ? undefined : d));
  }

  // Retrieve all the data objects.
  async getAll(): Promise<IDataObject[]> {
    return (await axios.post(path(this.#url, 'dataObjects', 'getAll'))).data;
  }

  async set(value: IDataObject): Promise<void> {
    await axios.post(path(this.#url, 'dataObjects', 'set'), { value });
  }

  // Set the data objects.
  async setBulk(values: IDataObject[]): Promise<void> {
    await axios.post(path(this.#url, 'dataObjects', 'setBulk'), { values });
  }

  shallowCopy(): IDataObjectStorage {
    return new DataObjectStorage(this.#url);
  }

  async slice(begin?: number, end?: number): Promise<IDataObject[]> {
    return (await axios.post(
      path(this.#url, 'dataObjects', 'slice'),
      { begin, end },
    )).data;
  }

  async uuids(): Promise<string[]> {
    return (await axios.post(path(this.#url, 'dataObjects', 'uuids'))).data;
  }
}

class LabelStorage implements ILabelStorage {
  #url: string;

  constructor(url: string) {
    this.#url = url;
  }

  // Count the number of labels.
  async count(query?: FilterQuery<unknown>): Promise<number> {
    return (await axios.post(path(this.#url, 'labels', 'count'), { query })).data;
  }

  // Delete all the labels.
  async deleteAll(): Promise<void> {
    await axios.post(path(this.#url, 'labels', 'deleteAll'));
  }

  // Retrieve a label by uuid.
  async get(uuid: string): Promise<ILabel | undefined> {
    const value: ILabel | null = (await axios.post(
      path(this.#url, 'labels', 'get'),
      { uuid },
    )).data;
    return value === null ? undefined : value;
  }

  // Retrieve a list of labels by uuids.
  async getBulk(uuids: string[]): Promise<(ILabel | undefined)[]> {
    const values: (ILabel | null)[] = (await axios.post(
      path(this.#url, 'labels', 'getBulk'),
      { uuids },
    )).data;
    return values.map((d) => (d === null ? undefined : d));
  }

  // Retrieve all the labels.
  async getAll(): Promise<ILabel[]> {
    return (await axios.post(path(this.#url, 'labels', 'getAll'))).data;
  }

  // Retrieve a list of labels by condition.
  async getFiltered(query: FilterQuery<unknown>): Promise<ILabel[]> {
    return (await axios.post(
      path(this.#url, 'labels', 'getFiltered'),
      { query },
    )).data;
  }

  // Set the label.
  async set(value: ILabel): Promise<void> {
    await axios.post(path(this.#url, 'labels', 'set'), { value });
  }

  // Set the labels.
  async setBulk(values: ILabel[]): Promise<void> {
    await axios.post(path(this.#url, 'labels', 'setBulk'), { values });
  }

  shallowCopy(): ILabelStorage {
    return new LabelStorage(this.#url);
  }
}

class StatusStorage implements IStatusStorage {
  #url: string;

  constructor(url: string) {
    this.#url = url;
  }

  // Count the number of statuses.
  async count(query?: FilterQuery<unknown>): Promise<number> {
    return (await axios.post(
      path(this.#url, 'statuses', 'count'),
      { query },
    )).data;
  }

  // Delete all the statuses.
  async deleteAll(): Promise<void> {
    await axios.post(path(this.#url, 'statuses', 'deleteAll'));
  }

  // Retrieve a status by uuid.
  async get(uuid: string): Promise<IStatus | undefined> {
    const value: IStatus | null = (await axios.post(
      path(this.#url, 'statuses', 'get'),
      { uuid },
    )).data;
    return value === null ? undefined : value;
  }

  // Retrieve a list of statuses by uuids.
  async getBulk(uuids: string[]): Promise<(IStatus | undefined)[]> {
    const values: (IStatus | null)[] = (await axios.post(
      path(this.#url, 'statuses', 'getBulk'),
      { uuids },
    )).data;
    return values.map((d) => (d === null ? undefined : d));
  }

  // Retrieve all the statuses.
  async getAll(): Promise<IStatus[]> {
    return (await axios.post(path(this.#url, 'statuses', 'getAll'))).data;
  }

  // Set the status.
  async set(value: IStatus): Promise<void> {
    await axios.post(path(this.#url, 'statuses', 'set'), { value });
  }

  // Set the statuses.
  async setBulk(values: IStatus[]): Promise<void> {
    await axios.post(path(this.#url, 'statuses', 'setBulk'), { values });
  }

  shallowCopy(): IStatusStorage {
    return new StatusStorage(this.#url);
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

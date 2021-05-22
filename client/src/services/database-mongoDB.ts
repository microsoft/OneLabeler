import axios from 'axios';
import { FilterQuery } from 'mongoose';
import {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  IStatus,
  IStatusStorage,
} from '@/commons/types';

const URL = 'http://localhost:8887/database';
const path = (storage: string, op: string) => `${URL}/${storage}/${op}`;

export const dataObjectDB: IDataObjectStorage = Object.freeze({
  // Add one data object.
  async add(value: IDataObject): Promise<void> {
    await axios.post(path('dataObjects', 'add'), { value });
  },
  // Count the number of data objects.
  async count(): Promise<number> {
    return (await axios.post(path('dataObjects', 'count'))).data;
  },
  // Delete all the data objects.
  async deleteAll(): Promise<void> {
    await axios.post(path('dataObjects', 'deleteAll'));
  },
  // Retrieve a data object by uuid.
  async get(uuid: string): Promise<IDataObject | undefined> {
    const value: IDataObject | null = (await axios.post(
      path('dataObjects', 'get'),
      { uuid },
    )).data;
    return value === null ? undefined : value;
  },
  // Retrieve a list of data objects by uuids.
  async getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]> {
    const values: (IDataObject | null)[] = (await axios.post(
      path('dataObjects', 'getBulk'),
      { uuids },
    )).data;
    return values.map((d) => (d === null ? undefined : d));
  },
  // Retrieve all the data objects.
  async getAll(): Promise<IDataObject[]> {
    return (await axios.post(path('dataObjects', 'getAll'))).data;
  },
  async set(value: IDataObject): Promise<void> {
    await axios.post(path('dataObjects', 'set'), { value });
  },
  // Set the data objects.
  async setBulk(values: IDataObject[]): Promise<void> {
    await axios.post(path('dataObjects', 'setBulk'), { values });
  },
  shallowCopy(): IDataObjectStorage {
    return { ...this };
  },
  async slice(begin?: number, end?: number): Promise<IDataObject[]> {
    return (await axios.post(
      path('dataObjects', 'slice'),
      { begin, end },
    )).data;
  },
  async uuids(): Promise<string[]> {
    return (await axios.post(path('dataObjects', 'uuids'))).data;
  },
});

export const labelDB: ILabelStorage = Object.freeze({
  // Count the number of labels.
  async count(query?: FilterQuery<unknown>): Promise<number> {
    return (await axios.post(path('labels', 'count'), { query })).data;
  },
  // Delete all the labels.
  async deleteAll(): Promise<void> {
    await axios.post(path('labels', 'deleteAll'));
  },
  // Retrieve a label by uuid.
  async get(uuid: string): Promise<ILabel | undefined> {
    const value: ILabel | null = (await axios.post(
      path('labels', 'get'),
      { uuid },
    )).data;
    return value === null ? undefined : value;
  },
  // Retrieve a list of labels by uuids.
  async getBulk(uuids: string[]): Promise<(ILabel | undefined)[]> {
    const values: (ILabel | null)[] = (await axios.post(
      path('labels', 'getBulk'),
      { uuids },
    )).data;
    return values.map((d) => (d === null ? undefined : d));
  },
  // Retrieve all the labels.
  async getAll(): Promise<ILabel[]> {
    return (await axios.post(path('labels', 'getAll'))).data;
  },
  // Retrieve a list of labels by condition.
  async getFiltered(query: FilterQuery<unknown>): Promise<ILabel[]> {
    return (await axios.post(
      path('labels', 'getFiltered'),
      { query },
    )).data;
  },
  // Set the label.
  async set(value: ILabel): Promise<void> {
    await axios.post(path('labels', 'set'), { value });
  },
  // Set the labels.
  async setBulk(values: ILabel[]): Promise<void> {
    await axios.post(path('labels', 'setBulk'), { values });
  },
  shallowCopy(): ILabelStorage {
    return { ...this };
  },
});

export const statusDB: IStatusStorage = Object.freeze({
  // Count the number of statuses.
  async count(query?: FilterQuery<unknown>): Promise<number> {
    return (await axios.post(
      path('statuses', 'count'),
      { query },
    )).data;
  },
  // Delete all the statuses.
  async deleteAll(): Promise<void> {
    await axios.post(path('statuses', 'deleteAll'));
  },
  // Retrieve a status by uuid.
  async get(uuid: string): Promise<IStatus | undefined> {
    const value: IStatus | null = (await axios.post(
      path('statuses', 'get'),
      { uuid },
    )).data;
    return value === null ? undefined : value;
  },
  // Retrieve a list of statuses by uuids.
  async getBulk(uuids: string[]): Promise<(IStatus | undefined)[]> {
    const values: (IStatus | null)[] = (await axios.post(
      path('statuses', 'getBulk'),
      { uuids },
    )).data;
    return values.map((d) => (d === null ? undefined : d));
  },
  // Retrieve all the statuses.
  async getAll(): Promise<IStatus[]> {
    return (await axios.post(path('statuses', 'getAll'))).data;
  },
  // Set the status.
  async set(value: IStatus): Promise<void> {
    await axios.post(path('statuses', 'set'), { value });
  },
  // Set the statuses.
  async setBulk(values: IStatus[]): Promise<void> {
    await axios.post(path('statuses', 'setBulk'), { values });
  },
  shallowCopy(): IStatusStorage {
    return { ...this };
  },
});

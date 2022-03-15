// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import mongoose, { FilterQuery } from 'mongoose';
import {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  IStatus,
  IStatusStorage,
  IStorageStore,
} from './commons/types';
import { randomChoice } from './commons/random';

/* eslint max-classes-per-file: ["error", 4] */

const DB_NAME = 'DataLabelingStorage';
// Note: when distributing database and mongodb in separate docker images,
// the address of mongodb is normally not localhost or 127.0.0.1,
// and is dependent on the image name in the docker file.
const DB_URL: string = process.env.NODE_ENV === 'development'
  ? `mongodb://localhost:27017/${DB_NAME}`
  : `mongodb://mongo:27017/${DB_NAME}`;

type EmptyObject = Record<string, never>;
type IDataObjectModel = mongoose.Model<IDataObject, EmptyObject, EmptyObject>;
type ILabelModel = mongoose.Model<ILabel, EmptyObject, EmptyObject>;
type IStatusModel = mongoose.Model<IStatus, EmptyObject, EmptyObject>;

const DataObjectSchema = new mongoose.Schema<IDataObject>({
  uuid: { type: String, required: true },
  features: Array,
}, { strict: false });
const LabelSchema = new mongoose.Schema<ILabel>({
  uuid: { type: String, required: true },
  category: String,
  shapes: Array,
  mask: {
    path: String,
    label2color: Map,
    width: Number,
    height: Number,
  },
}, { strict: true });
const StatusSchema = new mongoose.Schema({
  uuid: { type: String, required: true },
  value: { type: String, required: true },
}, { strict: true });

const dataObjectModel: IDataObjectModel = mongoose.model<IDataObject>(
  'DataObject',
  DataObjectSchema,
);
const labelModel: ILabelModel = mongoose.model<ILabel>('Label', LabelSchema);
const statusModel: IStatusModel = mongoose.model<IStatus>('Status', StatusSchema);

const sortAndPadMatches = <T extends { uuid: string }>(
  uuids: string[],
  matches: T[],
): (T | undefined)[] => {
  // Sort the matches by the uuids' order,
  // and pad undefined for unmatched uuids.
  const uuid2matchIdx: Record<string, number | undefined> = {};
  matches.forEach((match, i) => {
    uuid2matchIdx[match.uuid] = i;
  });
  const formattedMatches = uuids.map((uuid) => {
    const matchedIdx = uuid2matchIdx[uuid];
    return matchedIdx !== undefined ? matches[matchedIdx] : undefined;
  });
  return formattedMatches;
};

class DataObjectStorage implements IDataObjectStorage {
  #storage: IDataObjectModel;

  constructor(storage: IDataObjectModel) {
    this.#storage = storage;
  }

  async count(): Promise<number> {
    return this.#storage.countDocuments();
  }

  async deleteAll(): Promise<void> {
    await this.#storage.deleteMany({});
  }

  async get(uuid: string): Promise<IDataObject | undefined> {
    const match: IDataObject | null = await this.#storage
      .findOne({ uuid }).lean();
    if (match === null) return undefined;
    return match;
  }

  async getAll(): Promise<IDataObject[]> {
    return this.#storage.find({}).lean();
  }

  async getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]> {
    const matches: IDataObject[] = await this.#storage
      .find({ uuid: { $in: uuids } }).lean();
    return sortAndPadMatches(uuids, matches);
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
    const samples: IDataObject[] = await Promise.all(selection.map(
      async (idx): Promise<IDataObject> => this.#storage.findOne().skip(idx).lean(),
    ));
    return samples;
  }

  shallowCopy(): IDataObjectStorage {
    return new DataObjectStorage(this.#storage);
  }

  async slice(begin?: number, end?: number): Promise<IDataObject[]> {
    if (begin !== undefined && end !== undefined) {
      // When begin >= end, return an empty slice.
      const n = Math.max(end - begin, 0);
      // Note: the edge case of setting limit = 0 for mongoose
      // is equivalent to not setting limit.
      if (n === 0) return [];
      return this.#storage.find({}).skip(begin).limit(n).lean();
    }
    if (begin !== undefined && end === undefined) {
      return this.#storage.find({}).skip(begin).lean();
    }
    if (begin === undefined && end !== undefined) {
      return this.#storage.find({}).limit(end).lean();
    }
    return this.#storage.find({}).lean();
  }

  async upsert(value: IDataObject): Promise<void> {
    await this.#storage.updateOne(
      { uuid: value.uuid },
      value,
      { upsert: true },
    );
  }

  async upsertBulk(values: IDataObject[]): Promise<void> {
    const ops = values.map((d) => ({
      updateOne: {
        filter: { uuid: d.uuid },
        update: d,
        upsert: true,
      }
    }));
    await this.#storage.bulkWrite(ops);
  }

  async uuids(): Promise<string[]> {
    return this.#storage.find({}).distinct('uuid').lean();
  }
}

class LabelStorage implements ILabelStorage {
  #storage: ILabelModel;

  constructor(storage: ILabelModel) {
    this.#storage = storage;
  }

  async count(query?: FilterQuery<unknown>): Promise<number> {
    if (query === undefined) {
      return this.#storage.countDocuments();
    }
    return this.#storage.countDocuments(query);
  }

  async deleteAll(): Promise<void> {
    await this.#storage.deleteMany({});
  }

  async get(uuid: string): Promise<ILabel | undefined> {
    const match: ILabel | null = await this.#storage
      .findOne({ uuid }).lean();
    if (match === null) return undefined;
    return match;
  }

  async getAll(): Promise<ILabel[]> {
    return this.#storage.find({}).lean();
  }

  async getBulk(uuids: string[]): Promise<(ILabel | undefined)[]> {
    const matches: ILabel[] = await this.#storage
      .find({ uuid: { $in: uuids } }).lean();
    return sortAndPadMatches(uuids, matches);
  }

  async getFiltered(query: FilterQuery<unknown>): Promise<ILabel[]> {
    return this.#storage.find(query).lean();
  }

  shallowCopy(): ILabelStorage {
    return new LabelStorage(this.#storage);
  }

  async upsert(value: ILabel): Promise<void> {
    await this.#storage.updateOne(
      { uuid: value.uuid },
      value,
      { upsert: true },
    );
  }

  async upsertBulk(values: ILabel[]): Promise<void> {
    const ops = values.map((d) => ({
      updateOne: {
        filter: { uuid: d.uuid },
        update: d,
        upsert: true,
      }
    }));
    await this.#storage.bulkWrite(ops);
  }
}

class StatusStorage implements IStatusStorage {
  #storage: IStatusModel;

  constructor(storage: IStatusModel) {
    this.#storage = storage;
  }

  async count(query?: FilterQuery<unknown>): Promise<number> {
    if (query === undefined) {
      return this.#storage.countDocuments();
    }
    return this.#storage.countDocuments(query);
  }

  async deleteAll(): Promise<void> {
    await this.#storage.deleteMany({});
  }

  async get(uuid: string): Promise<IStatus | undefined> {
    const match: IStatus | null = await this.#storage
      .findOne({ uuid: { $eq: uuid } }).lean();
    if (match === null) return undefined;
    return match;
  }

  async getAll(): Promise<IStatus[]> {
    return this.#storage.find({}).lean();
  }

  async getBulk(uuids: string[]): Promise<(IStatus | undefined)[]> {
    const matches: IStatus[] = await this.#storage
      .find({ uuid: { $in: uuids } }).lean();
    return sortAndPadMatches(uuids, matches);
  }

  async getFiltered(query: FilterQuery<unknown>): Promise<IStatus[]> {
    return this.#storage.find(query).lean();
  }

  shallowCopy(): IStatusStorage {
    return new StatusStorage(this.#storage);
  }

  async upsert(value: IStatus): Promise<void> {
    await this.#storage.updateOne(
      { uuid: value.uuid },
      value,
      { upsert: true },
    );
  }

  async upsertBulk(values: IStatus[]): Promise<void> {
    const ops = values.map((d) => ({
      updateOne: {
        filter: { uuid: d.uuid },
        update: d,
        upsert: true,
      }
    }));
    await this.#storage.bulkWrite(ops);
  }
}

class StorageStore implements IStorageStore {
  dataObjects: IDataObjectStorage;

  labels: ILabelStorage;

  statuses: IStatusStorage;

  constructor() {
    this.dataObjects = new DataObjectStorage(dataObjectModel);
    this.labels = new LabelStorage(labelModel);
    this.statuses = new StatusStorage(statusModel);
  }

  async init(): Promise<void> {
    try {
      await mongoose.connect(DB_URL);
    } catch (e) {
      console.error(`Mongoose connection error: ${(e as Error).message}`);
    }
  }
}

export default StorageStore;

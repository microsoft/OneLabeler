import mongoose, { FilterQuery } from 'mongoose';
import {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  IStatus,
  IStatusStorage,
} from './types';
import { randomChoice } from './random';

/* eslint max-classes-per-file: ["error", 4] */

const DB_NAME = 'DataLabelingStorage';
const DB_URL = `mongodb://localhost:27017/${DB_NAME}`;

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

type EmptyObject = Record<string, never>;
type IDataObjectModel = mongoose.Model<IDataObject, EmptyObject, EmptyObject>;
type ILabelModel = mongoose.Model<ILabel, EmptyObject, EmptyObject>;
type IStatusModel = mongoose.Model<IStatus, EmptyObject, EmptyObject>;

class DataLabelingDB {
  dataObjects: IDataObjectModel;

  labels: ILabelModel;

  statuses: IStatusModel;

  constructor() {
    this.dataObjects = mongoose.model<IDataObject>('DataObject', DataObjectSchema);
    this.labels = mongoose.model<ILabel>('Label', LabelSchema);
    this.statuses = mongoose.model<IStatus>('Status', StatusSchema);
  }
}

const formatMatches = <T extends { uuid: string }>(
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

class DataObjectDB implements IDataObjectStorage {
  #storage: IDataObjectModel;

  constructor(storage: IDataObjectModel) {
    this.#storage = storage;
  }

  // Add one data object.
  async add(value: IDataObject): Promise<void> {
    const entry = new this.#storage(value);
    await entry.save();
  }

  // Count the number of data objects.
  async count(): Promise<number> {
    return this.#storage.countDocuments();
  }

  // Delete all the data objects.
  async deleteAll(): Promise<void> {
    await this.#storage.deleteMany({});
  }

  // Retrieve a data object by uuid.
  async get(uuid: string): Promise<IDataObject | undefined> {
    const match: IDataObject | null = await this.#storage
      .findOne({ uuid }).lean();
    if (match === null) return undefined;
    return match;
  }

  // Retrieve a list of data objects by uuids.
  async getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]> {
    const matches: IDataObject[] = await this.#storage
      .find({ uuid: { $in: uuids } }).lean();
    return formatMatches(uuids, matches);
  }

  // Retrieve all the data objects.
  async getAll(): Promise<IDataObject[]> {
    return this.#storage.find({}).lean();
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

  async set(value: IDataObject): Promise<void> {
    await this.#storage.updateOne(
      { uuid: value.uuid },
      value,
      { upsert: true },
    );
  }

  // Set the data objects.
  async setBulk(values: IDataObject[]): Promise<void> {
    const ops = values.map((d) => ({
      updateOne: {
        filter: { uuid: d.uuid },
        update: d,
        upsert: true,
      }
    }));
    await this.#storage.bulkWrite(ops);
  }

  shallowCopy(): IDataObjectStorage {
    return new DataObjectDB(this.#storage);
  }

  async slice(begin?: number, end?: number): Promise<IDataObject[]> {
    if (begin !== undefined && end !== undefined) {
      const n = end - begin;
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

  async uuids(): Promise<string[]> {
    return this.#storage.find({}).distinct('uuid').lean();
  }
}

class LabelDB implements ILabelStorage {
  #storage: ILabelModel;

  constructor(storage: ILabelModel) {
    this.#storage = storage;
  }

  // Count the number of labels.
  async count(query?: FilterQuery<unknown>): Promise<number> {
    if (query === undefined) {
      return this.#storage.countDocuments();
    }
    return this.#storage.countDocuments(query);
  }

  // Delete all the labels.
  async deleteAll(): Promise<void> {
    await this.#storage.deleteMany({});
  }

  // Retrieve a label by uuid.
  async get(uuid: string): Promise<ILabel | undefined> {
    const match: ILabel | null = await this.#storage
      .findOne({ uuid }).lean();
    if (match === null) return undefined;
    return match;
  }

  // Retrieve a list of labels by uuids.
  async getBulk(uuids: string[]): Promise<(ILabel | undefined)[]> {
    const matches: ILabel[] = await this.#storage
      .find({ uuid: { $in: uuids } }).lean();
    return formatMatches(uuids, matches);
  }

  // Retrieve all the labels.
  async getAll(): Promise<ILabel[]> {
    return this.#storage.find({}).lean();
  }

  // Retrieve a list of labels by condition.
  async getFiltered(query: FilterQuery<unknown>): Promise<ILabel[]> {
    return this.#storage.find(query).lean();
  }

  // Set the label.
  async set(value: ILabel): Promise<void> {
    await this.#storage.updateOne(
      { uuid: value.uuid },
      value,
      { upsert: true },
    );
  }

  // Set the labels.
  async setBulk(values: ILabel[]): Promise<void> {
    const ops = values.map((d) => ({
      updateOne: {
        filter: { uuid: d.uuid },
        update: d,
        upsert: true,
      }
    }));
    await this.#storage.bulkWrite(ops);
  }

  shallowCopy(): ILabelStorage {
    return new LabelDB(this.#storage);
  }
}

class StatusDB implements IStatusStorage {
  #storage: IStatusModel;

  constructor(storage: IStatusModel) {
    this.#storage = storage;
  }

  // Count the number of statuses.
  async count(query?: FilterQuery<unknown>): Promise<number> {
    if (query === undefined) {
      return this.#storage.countDocuments();
    }
    return this.#storage.countDocuments(query);
  }

  // Delete all the statuses.
  async deleteAll(): Promise<void> {
    await this.#storage.deleteMany({});
  }

  // Retrieve a status by uuid.
  async get(uuid: string): Promise<IStatus | undefined> {
    const match: IStatus | null = await this.#storage
      .findOne({ uuid: { $eq: uuid } }).lean();
    if (match === null) return undefined;
    return match;
  }

  // Retrieve a list of statuses by uuids.
  async getBulk(uuids: string[]): Promise<(IStatus | undefined)[]> {
    const matches: IStatus[] = await this.#storage
      .find({ uuid: { $in: uuids } }).lean();
    return formatMatches(uuids, matches);
  }

  // Retrieve all the statuses.
  async getAll(): Promise<IStatus[]> {
    return this.#storage.find({}).lean();
  }

  // Set the status.
  async set(value: IStatus): Promise<void> {
    await this.#storage.updateOne(
      { uuid: value.uuid },
      value,
      { upsert: true },
    );
  }

  // Set the statuses.
  async setBulk(values: IStatus[]): Promise<void> {
    const ops = values.map((d) => ({
      updateOne: {
        filter: { uuid: d.uuid },
        update: d,
        upsert: true,
      }
    }));
    await this.#storage.bulkWrite(ops);
  }

  shallowCopy(): IStatusStorage {
    return new StatusDB(this.#storage);
  }
}

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
const DB = new DataLabelingDB();
export const dataObjectDB = new DataObjectDB(DB.dataObjects);
export const labelDB = new LabelDB(DB.labels);
export const statusDB = new StatusDB(DB.statuses);

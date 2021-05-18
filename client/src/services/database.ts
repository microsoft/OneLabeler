import Dexie from 'dexie';
import { IDataObject, IDataObjectStorage } from '@/commons/types';

export class DataObjectDB extends Dexie implements IDataObjectStorage {
  dataObjects: Dexie.Table<IDataObject, string>;

  constructor() {
    super('database');
    this.version(1).stores({ dataObjects: 'uuid' });
    this.dataObjects = this.table('dataObjects');
  }

  // Add one data object.
  async add(dataObject: IDataObject): Promise<void> {
    await this.dataObjects.add(dataObject);
  }

  // Count the number of data objects.
  count(): Promise<number> {
    return this.dataObjects.count();
  }

  // Delete all the data objects.
  async deleteAll(): Promise<void> {
    await this.delete();
  }

  // Retrieve a data object by uuid.
  get(uuid: string): Promise<IDataObject | undefined> {
    return this.dataObjects.get(uuid);
  }

  // Retrieve a list of data objects by uuids.
  getBulk(uuids: string[]): Promise<(IDataObject | undefined)[]> {
    return this.dataObjects.bulkGet(uuids);
  }

  // Retrieve all the data objects.
  getAll(): Promise<IDataObject[]> {
    return this.dataObjects.toArray();
  }

  // Set the data objects.
  async setBulk(dataObjects: IDataObject[]): Promise<void> {
    await this.dataObjects.bulkPut(dataObjects);
  }
}

export const dataObjectDB = new DataObjectDB();

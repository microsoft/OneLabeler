import Dexie from 'dexie';
import { IDataObject, IDataObjectsStorage } from '@/commons/types';

export class DataObjectsDB extends Dexie implements IDataObjectsStorage {
  dataObjects: Dexie.Table<IDataObject, string>;

  constructor() {
    super('database');
    this.version(1).stores({ dataObjects: 'uuid,i' });
    this.dataObjects = this.table('dataObjects');
  }

  // Add one data object.
  addDataObject(dataObject: IDataObject) {
    return this.dataObjects.add(dataObject);
  }

  // Retrieve all the data objects.
  allDataObjects(): Promise<IDataObject[]> {
    return this.dataObjects.toArray();
  }

  // Count the number of data objects.
  countDataObjects(): Promise<number> {
    return this.dataObjects.count();
  }

  // Delete all the data objects.
  deleteDataObjects() {
    return this.delete();
  }

  getDataObjectByIdx(i: number): Promise<IDataObject | undefined> {
    return this.dataObjects.get({ i });
  }

  getDataObjectByIdxs(indices: number[]): Promise<(IDataObject | undefined)[]> {
    return this.dataObjects.filter((d) => indices.includes(d.i)).toArray();
  }

  // Retrieve a data object by uuid.
  getDataObjectByUuid(uuid: string): Promise<IDataObject | undefined> {
    return this.dataObjects.get(uuid);
  }

  // Retrieve a list of data objects by uuids.
  getDataObjectByUuids(uuids: string[]): Promise<(IDataObject | undefined)[]> {
    return this.dataObjects.bulkGet(uuids);
  }

  // Set the data objects.
  setDataObjects(dataObjects: IDataObject[]) {
    return this.dataObjects.bulkPut(dataObjects);
  }
}

export const dataObjectsDB = new DataObjectsDB();

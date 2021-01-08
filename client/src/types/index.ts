export interface IDataObject {
  uuid: string | null, // the universal unique id of the data object
  features?: number[], // the features of the data object
}

export interface IImage extends IDataObject {
  path: string | null, // the storage path of the image on the server
  width?: number | null, // the width of the image
  height?: number | null, // the height of the image
}

// the type of data labels
export type Label = string | number | boolean

export enum Status {
  NEW = 'NEW', // the data object is not viewed and not labeled
  VIEWED = 'VIEWED', // the data object is viewed but not yet labeled
  SKIPPED = 'SKIPPED', // the data object is viewed but skipped
  LABELED = 'LABELED', // the data object is labeled
}

export interface ICommand {
  execute: () => void;
  undo: () => void;
}

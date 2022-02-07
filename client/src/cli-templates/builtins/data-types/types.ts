import type { VueConstructor } from 'vue';
import type { ILabel, LabelTaskType } from '@/builtins/label-task-types/types';
import type { IDataObjectStorage } from '@/commons/types';

/** The types of data objects. */
export enum DataType {
  Audio = 'Audio',
  Image = 'Image',
  VectorImage = 'VectorImage',
  Text = 'Text',
  Video = 'Video',
  YoutubeVideo = 'YoutubeVideo',
  PointCloud = 'PointCloud',
  Webpage = 'Webpage',
  PDF = 'PDF',
}

/** The interface of a data object to be labeled. */
export interface IDataObject {
  /** The universal unique id of the data object. */
  uuid: string;
  /** The content of the data object. */
  content?: unknown;
  /** The storage url of the data object. */
  url?: string | null;
  /** The features of the data object. */
  features?: number[];
}

export enum UploadTarget {
  File = 'File',
  Folder = 'Folder',
}

/** The data type setup abstracting type-dependent properties. */
export interface IDataTypeSetup<T extends UploadTarget> {
  type: DataType | string;
  tasks: (LabelTaskType | string)[];
  label: string;
  importType: T;
  handleImport: (
    input: T extends UploadTarget.File ? File : FileList,
    storage: IDataObjectStorage,
  ) => void | Promise<void>;
  handleExport: (
    dataObjects: IDataObject[],
    labels: ILabel[],
  ) => Record<string, unknown>[];
  display: VueConstructor;
}

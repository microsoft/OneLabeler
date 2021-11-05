import { VueConstructor } from 'vue';
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

/** The interface of an image data object. */
export interface IImage extends IDataObject {
  /** The image content as base64 string. */
  content?: string | null;
  /** The width of the image. */
  width?: number | null;
  /** The height of the image. */
  height?: number | null;
}

/** The interface of a vector image data object. */
export interface IVectorImage extends IDataObject {
  /** The svg content as a string. */
  content?: string | null;
}

/** The interface of an text data object. */
export interface IText extends IDataObject {
  /** The text content. */
  content?: string | null;
}

/** The interface of a media (video/audio) data object. */
export interface IMedia extends IDataObject {
  /** The media content as base64 string. */
  content: string | null;
  /** The duration of the media. */
  duration?: number;
}

/** The interface of an audio data object. */
export interface IAudio extends IMedia {
  /** The audio content as base64 string or url. */
  content: string | null;
  /** The duration of the audio. */
  duration?: number;
}

/** The interface of a video data object. */
export interface IVideo extends IMedia {
  /** The video content as base64 string or url. */
  content: string | null;
  /** The width of the video. */
  width: number;
  /** The height of the video. */
  height: number;
  /** The duration of the video. */
  duration?: number;
}

/** The interface of a webpage data object. */
export interface IWebpage extends IDataObject {
  /** The webpage url. */
  content?: string | null;
}

export type Vector3d = [number, number, number];

/** The interface of a point cloud object. */
export interface IPointCloud extends IDataObject {
  /** The 3d points. */
  content: Vector3d[];
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
    storage: IDataObjectStorage
  ) => void | Promise<void>;
  handleExport: (
    dataObjects: IDataObject[],
    labels: ILabel[],
  ) => Record<string, unknown>[];
  display: VueConstructor;
}

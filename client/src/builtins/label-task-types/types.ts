import type { VueConstructor } from 'vue';

/** The types of label tasks. */
export enum LabelTaskType {
  Classification = 'Classification',
  MultiLabelClassification = 'MultiLabelClassification',
  FreeformText = 'FreeformText',
  AnnotationRelation = 'AnnotationRelation',
  ObjectDetection = 'ObjectDetection',
  Segmentation2d = 'Segmentation2d',
  Segmentation3d = 'Segmentation3d',
  SpanClassification = 'SpanClassification',
}

/** The label category. */
export type Category = string;

/** The type of data category labels. */
export type ILabelCategory = Category;

export type ILabelMultiCategory = Category[];

/** The interface of the freeform text label of a data object. */
export interface ILabelText {
  /** The text annotation. */
  content: string | null;
}

/** The type of data shapes in polygon annotation. */
export enum ObjectShapeType {
  Polygon = 'Polygon',
  Rect = 'Rect',
  Point = 'Point',
}

type Point = [number, number];

/** The interface of a polygon annotation in an image data object. */
export interface ILabelShape {
  category: Category;
  shape: ObjectShapeType;
  // For rect, position only store diagonal points,
  // (either top left and bottom right or top right and bottom left).
  position: Point[] | Point;
  /** The uuid is for recognizing which shape in the canvas
   * corresponds to which label shape. */
  uuid?: string | null;
}

/** The interface of the segmentation label of an image data object. */
export interface ILabelMask {
  /** The mask content as base64 string. */
  content: string | null;
  /** The color encoding of the stored mask image. */
  label2color?: { [key: string]: number | [number, number, number] } | null;
  /** The width of the mask. */
  width?: number | null;
  /** The height of the mask. */
  height?: number | null;
}

/** The interface of the span of part of a data object. */
export interface ILabelSpan {
  /** The start of the span. */
  start: number;
  /** The end of the span. */
  end: number;
  /** The category of the span. */
  category: Category;
  /** The uuid for differentiating spans with the same content. */
  uuid: string;
}

/** The interface of the named entity label of a text data object. */
export interface ILabelTextSpan extends ILabelSpan {
  /** The string of the entity. */
  text: string | null;
  /** The index of the entity's first character in the original text. */
  start: number;
  /** The index of the entity's first character after the original text. */
  end: number;
  /** The category of the entity. */
  category: Category;
  /** The uuid for differentiating spans with the same content. */
  uuid: string;
}

/** The interface of the temporal span of a video/audio data object. */
export interface ILabelTimeSpan extends ILabelSpan {
  /** The timestamp of the first frame. */
  start: number;
  /** The timestamp of the final frame. */
  end: number;
  /** The category of the span. */
  category: Category;
  /** The uuid for differentiating spans with the same content. */
  uuid: string;
}

/** The interface of the relation between two annotations. */
export interface ILabelRelation {
  /** The uuid of the source annotation. */
  sourceUuid: string;
  /** The uuid of the target annotation. */
  targetUuid: string;
  /** The uuid of the annotation itself. */
  uuid: string;
}

/** The interface of a list storing point segmentation of points in a point cloud data object. */
export type ILabelPoints = Category[];

export interface ILabel {
  /** The uuid of the data object that owns the label. */
  uuid: string;
  /** Different modalities of label. */
  category?: ILabelCategory;
  multiCategory?: ILabelMultiCategory;
  text?: ILabelText;
  shapes?: ILabelShape[];
  mask?: ILabelMask;
  spans?: ILabelTextSpan[];
  relations?: ILabelRelation[];
  pointLabels?: ILabelPoints;
  [content: string]: unknown;
}

/** The query data structure for updating the label with the partial value. */
export type LabelUpsertQuery = Partial<ILabel> & { uuid: string };

/** The label task type setup. */
export interface ILabelTaskTypeSetup {
  type: LabelTaskType | string;
  label: string;
  /** The UI widget for single object labeling. */
  singleTool?: VueConstructor;
  /** The UI widget for batch labeling. */
  batchTool?: VueConstructor;
  /** The UI widget for displaying single object label in a dedicated panel. */
  panel?: VueConstructor;
  /** The UI widget for overlaying single object label and interaction trigger. */
  overlay?: VueConstructor;
}

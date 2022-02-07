import type { VueConstructor } from 'vue';

export interface ILabel {
  /** The uuid of the data object that owns the label. */
  uuid: string;
  /** Different modalities of label. */
  [content: string]: unknown;
}

/** The query data structure for updating the label with the partial value. */
export type LabelUpsertQuery = Partial<ILabel> & { uuid: string };

/** The label task type setup. */
export interface ILabelTaskTypeSetup {
  type: string;
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

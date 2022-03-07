import { ILabelText } from '@/commons/types';

// The custom types for this custom application.

export type Query = {
  text: string;
  // eslint-disable-next-line camelcase
  back_text: string;
  // eslint-disable-next-line camelcase
  related_attr: string[];
  type: string;
}

export interface IDataObject {
  uuid: string;
  content: {
    table: Record<string, unknown>[];
    queries: Query[];
  };
}

export interface ILabel {
  uuid: string;
  columns?: string[];
  queries?: Query[];
  text?: ILabelText;
}

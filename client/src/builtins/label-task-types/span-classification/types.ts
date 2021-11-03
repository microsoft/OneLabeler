import { Category, ILabelTextSpan } from '@/commons/types';

export type ToolbarState = {
  selectedSpan: ILabelTextSpan | null;
  strokeCategory: Category | null;
}

export type Box = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  span: ILabelTextSpan;
}

import { Category, ILabelTextSpan } from '@/commons/types';

export enum MouseOperationType {
  PanAndZoom = 'PanAndZoom',
  PaintBrush = 'PaintBrush',
  PaintErase = 'PaintErase',
}

export type ToolbarState = Partial<{
  mouseOperation: MouseOperationType | null;
  strokeCategory: Category | null;
  selectedSpan: ILabelTextSpan | null;
}>

import { Category } from '@/commons/types';

export enum MouseOperationType {
  PanAndZoom = 'PanAndZoom',
  PaintBrush = 'PaintBrush',
  PaintErase = 'PaintErase',
}

export type ToolbarState = {
  mouseOperation: MouseOperationType | string;
  strokeCategory: Category | string;
}

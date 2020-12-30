import { IImage } from '@/types/index';
import { State } from './types';

export const imgObjMirror = (state: State): IImage => state.imgObj;

export const imgTitleMirror = (state: State): string | null => state.imgTitle;

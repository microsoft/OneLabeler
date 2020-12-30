import { IImage } from '@/types/index';
import { State } from './types';
import * as types from './mutation-types';

export default {
  [types.SET_IMG_OBJ](state: State, imgObj: IImage): void {
    state.imgObj = imgObj;
  },
  [types.SET_IMG_TITLE](state: State, imgTitle: string): void {
    state.imgTitle = imgTitle;
  },
};

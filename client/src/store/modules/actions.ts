import { ActionContext } from 'vuex';
import { IImage } from '@/types/index';
import * as types from './mutation-types';
import { State } from './types';

export const setImgObj = function setImgObj(
  { commit }: ActionContext<State, State>,
  imgObj: IImage,
): void {
  commit(types.SET_IMG_OBJ, imgObj);
};

export const setImgTitle = function setImgTitle(
  { commit }: ActionContext<State, State>,
  imgTitle: string,
): void {
  commit(types.SET_IMG_TITLE, imgTitle);
};

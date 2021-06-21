import {
  IDataTypeSetup,
  UploadTarget,
} from '@/commons/types';
import audioTypeSetup from './audio';
import imageTypeSetup from './image';
import videoTypeSetup from './video';
import youtubeVideoTypeSetup from './youtube-video';
import textTypeSetup from './text';
import textWithTableTypeSetup from './text-with-table';

export default [
  audioTypeSetup,
  imageTypeSetup,
  videoTypeSetup,
  youtubeVideoTypeSetup,
  textTypeSetup,
  textWithTableTypeSetup,
] as IDataTypeSetup<UploadTarget>[];

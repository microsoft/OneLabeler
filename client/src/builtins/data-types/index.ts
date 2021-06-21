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
import textWithVideoTypeSetup from './text-with-video';

export default [
  audioTypeSetup,
  imageTypeSetup,
  videoTypeSetup,
  youtubeVideoTypeSetup,
  textTypeSetup,
  textWithTableTypeSetup,
  textWithVideoTypeSetup,
] as IDataTypeSetup<UploadTarget>[];

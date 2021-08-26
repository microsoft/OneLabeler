import {
  IDataTypeSetup,
  UploadTarget,
} from '@/commons/types';
import audioTypeSetup from './audio';
import imageTypeSetup from './image';
import videoTypeSetup from './video';
import youtubeVideoTypeSetup from './youtube-video';
import pointCloudTypeSetup from './point-cloud';
import webpageTypeSetup from './webpage';
// import webpageTypeSetup from './webpage/index-minimal';
import textTypeSetup from './text';
import textWithSpansTypeSetup from './text-with-spans';
import textWithTableTypeSetup from './text-with-table';
import textWithVideoTypeSetup from './text-with-video';
import MI3BlockTypeSetup from './discrete-bar-chart-block';

export default [
  audioTypeSetup,
  imageTypeSetup,
  videoTypeSetup,
  youtubeVideoTypeSetup,
  pointCloudTypeSetup,
  webpageTypeSetup,
  textTypeSetup,
  textWithSpansTypeSetup,
  textWithTableTypeSetup,
  textWithVideoTypeSetup,
  MI3BlockTypeSetup,
] as IDataTypeSetup<UploadTarget>[];

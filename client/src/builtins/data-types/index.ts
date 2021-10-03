import {
  IDataTypeSetup,
  UploadTarget,
} from '@/commons/types';
import audio from './audio';
import image from './image';
import video from './video';
import youtubeVideo from './youtube-video';
import pointCloud from './point-cloud';
import webpage from './webpage';
// import webpage from './webpage/index-minimal';
import text from './text';
// import textWithSpans from './text-with-spans';
// import textWithTable from './text-with-table';
// import textWithVideo from './text-with-video';
// import MI3Block from './discrete-bar-chart-block';
// import MI3Block from './discrete-bar-chart-block/index-minimal';
import table from './table';

export default [
  audio,
  image,
  video,
  youtubeVideo,
  pointCloud,
  webpage,
  text,
  // textWithSpans,
  // textWithTable,
  // textWithVideo,
  // MI3Block,
  table,
] as IDataTypeSetup<UploadTarget>[];

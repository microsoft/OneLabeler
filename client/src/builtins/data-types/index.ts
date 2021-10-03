import { IDataTypeSetup, UploadTarget } from '@/commons/types';
import audio from './audio';
import image from './image';
import video from './video';
import youtubeVideo from './youtube-video';
import pointCloud from './point-cloud';
import webpage from './webpage';
// import webpage from './webpage/index-minimal';
import text from './text';
// import customMI3Block from './custom-discrete-bar-chart-block';
// import customMI3Block from './custom-discrete-bar-chart-block/index-minimal';
// import customTextWithSpans from './custom-text-with-spans';
// import customTextWithTable from './custom-text-with-table';
// import customTextWithVideo from './custom-text-with-video';
import customTable from './custom-table';

export default [
  audio,
  image,
  video,
  youtubeVideo,
  pointCloud,
  webpage,
  text,
  // customMI3Block,
  // customTextWithSpans,
  // customTextWithTable,
  // customTextWithVideo,
  customTable,
] as IDataTypeSetup<UploadTarget>[];

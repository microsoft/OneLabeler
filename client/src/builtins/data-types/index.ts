import { IDataTypeSetup, UploadTarget } from '@/commons/types';
// import customMI3Block from '@/custom/mi3/data-types/discrete-bar-chart-block';
// import customMI3Block from '@/custom/mi3/data-types/discrete-bar-chart-block/index-minimal';
// import customTable from '@/custom/table-qa/data-types/table';
// import customTextWithSpans from '@/custom/data-insight/data-types/text-with-spans';
// import customTextWithTable from '@/custom/data-insight/data-types/text-with-table';
// import customTextWithVideo from '@/custom/youtube-data-story/data-types/text-with-video';
import audio from './audio';
import image from './image';
import video from './video';
import youtubeVideo from './youtube-video';
import pointCloud from './point-cloud';
import webpage from './webpage';
// import webpage from './webpage/index-minimal';
import text from './text';

export default [
  audio,
  image,
  video,
  youtubeVideo,
  pointCloud,
  webpage,
  text,
  // customMI3Block,
  // customTable,
  // customTextWithSpans,
  // customTextWithTable,
  // customTextWithVideo,
] as IDataTypeSetup<UploadTarget>[];

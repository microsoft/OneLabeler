import type { IDataTypeSetup, UploadTarget } from '@/commons/types';
// import customMI3Block from '@/custom/mi3/data-types/discrete-bar-chart-block';
// import customMI3Block from '@/custom/mi3/data-types/discrete-bar-chart-block/index-minimal';
// import customTable from '@/custom/table-qa/data-types/table';
// import customTextWithUuid from '@/custom/data-insight/data-types/text-with-uuid';
// import customTextWithSpans from '@/custom/data-insight/data-types/text-with-spans';
// import customTextWithTable from '@/custom/data-insight/data-types/text-with-table';
// import customTextWithVideo from '@/custom/youtube-data-story/data-types/text-with-video';
import customVectorImage from '@/custom/reverse-engineering/data-types/vector-image';
import audio from './audio';
import image from './image';
import pdf from './pdf';
import pointCloud from './point-cloud';
import text from './text';
import vectorImage from './vector-image';
import video from './video';
import webpage from './webpage';
// import webpage from './webpage/index-minimal';
import youtubeVideo from './youtube-video';

export default [
  audio,
  image,
  vectorImage,
  video,
  youtubeVideo,
  pdf,
  pointCloud,
  webpage,
  text,
  customVectorImage,
  // customMI3Block,
  // customTable,
  // customTextWithUuid,
  // customTextWithSpans,
  // customTextWithTable,
  // customTextWithVideo,
] as IDataTypeSetup<UploadTarget>[];

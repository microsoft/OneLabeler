import type { IDataTypeSetup, UploadTarget } from '@/commons/types';
import audio from './audio';
import image from './image';
import pdf from './pdf';
import pointCloud from './point-cloud';
import text from './text';
import vectorImage from './vector-image';
import video from './video';
import webpage from './webpage';
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
] as IDataTypeSetup<UploadTarget>[];

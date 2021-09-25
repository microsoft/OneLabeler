import audioClassification from './audio-classification';
import audioTemporalSegmentation from './audio-temporal-segmentation';
import imageClassificationIML from './image-classification-iml';
import imageClassification from './image-classification';
import imageSegmentation from './image-segmentation';
// import MI3Block from './mi3-block';
import pointCloudClassification from './point-cloud-classification';
import textClassification from './text-classification';
import textNamedEntityRecognition from './text-named-entity-recognition';
// import textWithTableMultiple from './text-with-table-classification-named-entity-recognition';
import videoClassification from './video-classification';
import videoTemporalSegmentation from './video-temporal-segmentation';
import webpageClassification from './webpage-classification';
import youtubeVideoTemporalSegmentation from './youtube-video-temporal-segmentation';

export default [
  audioClassification,
  audioTemporalSegmentation,
  imageClassificationIML,
  imageClassification,
  imageSegmentation,
  // MI3Block,
  pointCloudClassification,
  textClassification,
  textNamedEntityRecognition,
  // textWithTableMultiple,
  videoClassification,
  videoTemporalSegmentation,
  webpageClassification,
  youtubeVideoTemporalSegmentation,
];

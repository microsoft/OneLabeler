// import textWithTableMultiple from '@/custom/table-qa/workflow-templates/template';
// import MI3Block from '@/custom/mi3/workflow-templates/mi3-block';
import audioClassification from './templates/audio-classification';
import audioTemporalSegmentation from './templates/audio-temporal-segmentation';
import imageClassificationIML from './templates/image-classification-iml';
import imageClassification from './templates/image-classification';
import imageSegmentation from './templates/image-segmentation';
import pointCloudClassification from './templates/point-cloud-classification';
import pointCloudSegmentation from './templates/point-cloud-segmentation';
import textClassification from './templates/text-classification';
import textNamedEntityRecognition from './templates/text-named-entity-recognition';
import videoClassification from './templates/video-classification';
import videoTemporalSegmentation from './templates/video-temporal-segmentation';
import webpageClassification from './templates/webpage-classification';
import youtubeVideoTemporalSegmentation from './templates/youtube-video-temporal-segmentation';

export default [
  audioClassification,
  audioTemporalSegmentation,
  imageClassificationIML,
  imageClassification,
  imageSegmentation,
  // MI3Block,
  pointCloudClassification,
  pointCloudSegmentation,
  textClassification,
  textNamedEntityRecognition,
  // textWithTableMultiple,
  videoClassification,
  videoTemporalSegmentation,
  webpageClassification,
  youtubeVideoTemporalSegmentation,
];

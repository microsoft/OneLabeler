import audioClassification from './audio-classification';
import audioTemporalSegmentation from './audio-temporal-segmentation';
import imageClassificationIML from './image-classification-iml';
import imageClassification from './image-classification';
import imageSegmentation from './image-segmentation';
import MI3Block from './mi3-block';
import pointCloudClassification from './point-cloud-classification';
import textClassification from './text-classification';
import textNamedEntityRecognition from './text-named-entity-recognition';
import textWithTableClassificationNamedEntityRecognition from './text-with-table-classification-named-entity-recognition';
import videoClassification from './video-classification';
import videoTemporalSegmentation from './video-temporal-segmentation';
import webpageClassification from './webpage-classification';
import youtubeVideoTemporalSegmentation from './youtube-video-temporal-segmentation';

export default [
  { label: 'Audio Classification', value: audioClassification },
  { label: 'Audio Temporal Segmentation', value: audioTemporalSegmentation },
  { label: 'Image Classification with IML', value: imageClassificationIML },
  { label: 'Image Classification', value: imageClassification },
  { label: 'Image Segmentation', value: imageSegmentation },
  { label: 'MI3 Block', value: MI3Block },
  { label: 'Point Cloud Classification', value: pointCloudClassification },
  { label: 'Text Classification', value: textClassification },
  { label: 'Text Named Entity Recognition', value: textNamedEntityRecognition },
  { label: 'Text with Table Classification & Named Entity Recognition', value: textWithTableClassificationNamedEntityRecognition },
  { label: 'Video Classification', value: videoClassification },
  { label: 'Video Temporal Segmentation', value: videoTemporalSegmentation },
  { label: 'Webpage Classification', value: webpageClassification },
  { label: 'Youtube Video Temporal Segmentation', value: youtubeVideoTemporalSegmentation },
];

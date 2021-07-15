import audioClassificationMinimal from './audio-classification-minimal';
import audioTemporalSegmentationMinimal from './audio-temporal-segmentation-minimal';
import imageClassificationIML from './image-classification-iml';
import imageClassificationMinimal from './image-classification-minimal';
import imageSegmentationMinimal from './image-segmentation-minimal';
import videoClassificationMinimal from './video-classification-minimal';
import videoTemporalSegmentationMinimal from './video-temporal-segmentation-minimal';
import youtubeVideoTemporalSegmentationMinimal from './youtube-video-temporal-segmentation-minimal';
import pointCloudClassificationMinimal from './point-cloud-classification-minimal';
import textClassificationMinimal from './text-classification-minimal';
import textNamedEntityRecognitionMinimal from './text-named-entity-recognition-minimal';
import textWithTableClassificationNamedEntityRecognitionMinimal from './text-with-table-classification-named-entity-recognition-minimal';

export default [
  { label: 'Image Classification Minimal', value: imageClassificationMinimal },
  { label: 'Image Classification with IML', value: imageClassificationIML },
  { label: 'Image Segmentation Minimal', value: imageSegmentationMinimal },
  { label: 'Video Classification Minimal', value: videoClassificationMinimal },
  { label: 'Video Temporal Segmentation Minimal', value: videoTemporalSegmentationMinimal },
  { label: 'Youtube Video Temporal Segmentation Minimal', value: youtubeVideoTemporalSegmentationMinimal },
  { label: 'Audio Classification Minimal', value: audioClassificationMinimal },
  { label: 'Audio Temporal Segmentation Minimal', value: audioTemporalSegmentationMinimal },
  { label: 'Point Cloud Classification Minimal', value: pointCloudClassificationMinimal },
  { label: 'Text Classification Minimal', value: textClassificationMinimal },
  { label: 'Text Named Entity Recognition Minimal', value: textNamedEntityRecognitionMinimal },
  { label: 'Text with Table Classification & Named Entity Recognition Minimal', value: textWithTableClassificationNamedEntityRecognitionMinimal },
];

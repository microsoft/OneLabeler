import imageClassificationIML from '@/builtins/workflow-templates/image-classification-iml';
import imageClassificationMinimal from '@/builtins/workflow-templates/image-classification-minimal';
import imageSegmentationMinimal from '@/builtins/workflow-templates/image-segmentation-minimal';
import textClassificationMinimal from '@/builtins/workflow-templates/text-classification-minimal';
import textNamedEntityRecognitionMinimal from '@/builtins/workflow-templates/text-named-entity-recognition-minimal';
import textWithTableClassificationNamedEntityRecognitionMinimal from '@/builtins/workflow-templates/text-with-table-classification-named-entity-recognition-minimal';

export default [
  { label: 'Image Classification Minimal', value: imageClassificationMinimal },
  { label: 'Image Classification with IML', value: imageClassificationIML },
  { label: 'Image Segmentation Minimal', value: imageSegmentationMinimal },
  { label: 'Text Classification Minimal', value: textClassificationMinimal },
  { label: 'Text Named Entity Recognition Minimal', value: textNamedEntityRecognitionMinimal },
  { label: 'Text with Table Classification & Named Entity Recognition Minimal', value: textWithTableClassificationNamedEntityRecognitionMinimal },
];

import imageClassificationIML from '@/builtins/workflow-templates/image-classification-iml';
import imageClassificationMinimal from '@/builtins/workflow-templates/image-classification-minimal';
import imageSegmentationMinimal from '@/builtins/workflow-templates/image-segmentation-minimal';
import textClassificationMinimal from '@/builtins/workflow-templates/text-classification-minimal';

export default [
  { label: 'Image Classification Minimal', value: imageClassificationMinimal },
  { label: 'Image Classification with IML', value: imageClassificationIML },
  { label: 'Image Segmentation Minimal', value: imageSegmentationMinimal },
  { label: 'Text Classification Minimal', value: textClassificationMinimal },
];

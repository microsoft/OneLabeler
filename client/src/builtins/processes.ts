import {
  DataType,
  LabelTaskType,
  Process,
  ProcessType,
} from '@/commons/types';
import {
  PROTOCOL_ALGO,
  IP_ALGO,
  PORT_ALGO,
} from '@/services/http-params';
import DOSClustering from '@/builtins/modules/data-object-selection-clustering';
import DOSImageOverview from '@/builtins/modules/data-object-selection-image-overview';
import DOSProjection from '@/builtins/modules/data-object-selection-projection';
import DOSRandom from '@/builtins/modules/data-object-selection-random';
import FEImageSVD from '@/builtins/modules/feature-extraction-image-svd';
import ILGridMatrix from '@/builtins/modules/interactive-labeling-grid-matrix';
import ILSingleObjectDisplay from '@/builtins/modules/interactive-labeling-single-object-display';
import MTRetrain from '@/builtins/modules/model-training-retrain';
import MTStatic from '@/builtins/modules/model-training-static';
import SAAllChecked from '@/builtins/modules/stoppage-analysis-all-checked';

/**
 * TODO: [refactor] may store the valid processes at the data type declarations
 * so that given a customized data type, the existing processes can still be reused.
 */

const dataObjectSelectionMethods: Process[] = [
  DOSProjection, 
  DOSImageOverview, {
  type: ProcessType.DataObjectSelection,
  label: 'DatasetOrder (Dummy)',
  id: 'DatasetOrder',
  inputs: ['labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'DatasetOrder',
  params: {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
        { value: 4, label: '4' },
        { value: 16, label: '16' },
        { value: 32, label: '32' },
        { value: 48, label: '48' },
        { value: 64, label: '64' },
        { value: 96, label: '96' },
      ],
    },
  },
}, DOSRandom,
  DOSClustering, {
  type: ProcessType.DataObjectSelection,
  label: 'DenseAreas (Clustering)',
  id: 'DenseAreas-67390401',
  inputs: ['features', 'labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/selection/DenseAreas`,
  params: {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
        { value: 4, label: '4' },
        { value: 16, label: '16' },
        { value: 32, label: '32' },
        { value: 48, label: '48' },
        { value: 64, label: '64' },
        { value: 96, label: '96' },
      ],
    },
  },
}, {
  type: ProcessType.DataObjectSelection,
  label: 'ClusterCentroids (Clustering)',
  id: 'ClusterCentroids-60587176',
  inputs: ['features', 'labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/selection/ClusterCentroids`,
  params: {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
        { value: 4, label: '4' },
        { value: 16, label: '16' },
        { value: 32, label: '32' },
        { value: 48, label: '48' },
        { value: 64, label: '64' },
        { value: 96, label: '96' },
      ],
    },
  },
}, {
  type: ProcessType.DataObjectSelection,
  label: 'Entropy (Active Learning)',
  id: 'Entropy-49394355',
  inputs: ['features', 'labels', 'model'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: true,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/selection/Entropy`,
  model: undefined,
  params: {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
        { value: 4, label: '4' },
        { value: 16, label: '16' },
        { value: 32, label: '32' },
        { value: 48, label: '48' },
        { value: 64, label: '64' },
        { value: 96, label: '96' },
      ],
    },
  },
}, {
  type: ProcessType.DataObjectSelection,
  label: 'LeastConfident (Active Learning)',
  id: 'LeastConfident-12520162',
  inputs: ['features', 'labels', 'model'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: true,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/selection/LeastConfident`,
  model: undefined,
  params: {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
        { value: 4, label: '4' },
        { value: 16, label: '16' },
        { value: 32, label: '32' },
        { value: 48, label: '48' },
        { value: 64, label: '64' },
        { value: 96, label: '96' },
      ],
    },
  },
}, {
  type: ProcessType.DataObjectSelection,
  label: 'SmallestMargin (Active Learning)',
  id: 'SmallestMargin-74021796',
  inputs: ['features', 'labels', 'model'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: true,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/selection/SmallestMargin`,
  model: undefined,
  params: {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
        { value: 4, label: '4' },
        { value: 16, label: '16' },
        { value: 32, label: '32' },
        { value: 48, label: '48' },
        { value: 64, label: '64' },
        { value: 96, label: '96' },
      ],
    },
  },
}, {
  type: ProcessType.DataObjectSelection,
  label: 'EntropyDiversity (Active Learning)',
  id: 'EntropyDiversity-98931757',
  inputs: ['features', 'labels', 'model'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: true,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/selection/EntropyDiversity`,
  model: undefined,
  params: {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
        { value: 4, label: '4' },
        { value: 16, label: '16' },
        { value: 32, label: '32' },
        { value: 48, label: '48' },
        { value: 64, label: '64' },
        { value: 96, label: '96' },
      ],
    },
  },
}, {
  type: ProcessType.DataObjectSelection,
  label: 'EntropyDiversityDensity (Active Learning)',
  id: 'EntropyDiversityDensity-60957928',
  inputs: ['features', 'labels', 'model'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: true,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/selection/EntropyDiversityDensity`,
  model: undefined,
  params: {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
        { value: 4, label: '4' },
        { value: 16, label: '16' },
        { value: 32, label: '32' },
        { value: 48, label: '48' },
        { value: 64, label: '64' },
        { value: 96, label: '96' },
      ],
    },
  },
}];

const defaultLabelingMethods: Process[] = [{
  type: ProcessType.DefaultLabeling,
  label: 'ModelPrediction',
  id: 'ModelPrediction-29967546',
  inputs: ['features', 'model'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: true,
  isServerless: false,
  model: undefined,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/defaultLabels/ModelPrediction`,
}, {
  type: ProcessType.DefaultLabeling,
  label: 'POS-tagging',
  id: 'POS-tagging-438546',
  inputs: ['dataObjects', 'features'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/defaultLabels/POS-tagging`,
  dataTypes: [DataType.Text],
  labelTasks: [LabelTaskType.SpanClassification],
}, {
  type: ProcessType.DefaultLabeling,
  label: 'Null (Dummy)',
  id: 'Null-35514905',
  inputs: ['features'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'Null',
  labelTasks: [LabelTaskType.Classification],
}, {
  type: ProcessType.DefaultLabeling,
  label: 'Random (Dummy)',
  id: 'Random-38398168',
  inputs: ['features'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'Random',
  labelTasks: [LabelTaskType.Classification],
}];

const featureExtractionMethods: Process[] = [
  FEImageSVD, {
  type: ProcessType.FeatureExtraction,
  label: 'BoW (Handcrafted)',
  id: 'image-BoW-6989392',
  inputs: ['dataObjects'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/features/image/BoW`,
  dataTypes: [DataType.Image],
}, {
  type: ProcessType.FeatureExtraction,
  label: 'LDA (Supervised)',
  id: 'image-LDA-45100847',
  inputs: ['dataObjects', 'labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/features/image/LDA`,
  dataTypes: [DataType.Image],
}, {
  type: ProcessType.FeatureExtraction,
  label: 'NMF (Unsupervised)',
  id: 'text-NMF-78139065',
  inputs: ['dataObjects'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  api: `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/features/text/NMF`,
  dataTypes: [DataType.Text],
}, {
  type: ProcessType.FeatureExtraction,
  label: 'Random3D (Dummy)',
  id: 'Random-87333124',
  inputs: ['dataObjects'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  api: 'Random3D',
}];

const processes: Process[] = [
  ...dataObjectSelectionMethods,
  ...defaultLabelingMethods,
  ...featureExtractionMethods,
  // interactive labeling modules:
  ILGridMatrix,
  ILSingleObjectDisplay,
  // model training modules:
  MTRetrain,
  MTStatic,
  // stoppage analysis modules:
  SAAllChecked,
];

export default processes;

import ObjectId from 'bson-objectid';
import {
  ModelService,
  DataObjectSelectionMethod,
  DefaultLabelingMethod,
  FeatureExtractionMethod,
  InteractiveLabelingMethod,
  InterimModelTrainingMethod,
  StoppageAnalysisMethod,
  TaskTransformationMethod,
} from '@/commons/types';
import {
  PROTOCOL,
  IP,
  SERVER_PORT,
} from '@/services/http-params';

export const modelServices: ModelService[] = [{
  name: 'DecisionTree (Supervised)',
  isServerless: false,
  type: 'DecisionTree',
  isBuiltIn: true,
  objectId: (new ObjectId('DecisionTree')).toHexString(),
  usableAsSampler: false,
  // id: 'DecisionTree-95912701',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/DecisionTree`,
  // isLocal: true,
}, {
  name: 'SVM (Supervised)',
  isServerless: false,
  type: 'SVM',
  isBuiltIn: true,
  objectId: (new ObjectId('SVM000000000')).toHexString(),
  usableAsSampler: false,
  // id: 'SVM-99885399',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/SVM`,
  // isLocal: true,
}, {
  name: 'LogisticRegression (Supervised)',
  isServerless: false,
  type: 'LogisticRegression',
  isBuiltIn: true,
  objectId: (new ObjectId('LogisticRegr')).toHexString(),
  usableAsSampler: true,
  // id: 'LogisticRegression-75095119',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/LogisticRegression`,
  // isLocal: true,
}, {
  name: 'RestrictedBoltzmannMachine (Supervised)',
  isServerless: false,
  type: 'RestrictedBoltzmannMachine',
  isBuiltIn: true,
  objectId: (new ObjectId('RestrictedBo')).toHexString(),
  usableAsSampler: false,
  // id: 'RestrictedBoltzmannMachine-73157581',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/RestrictedBoltzmannMachine`,
  // isLocal: true,
}, {
  name: 'LabelSpreading (Semi-Supervised)',
  isServerless: false,
  type: 'LabelSpreading',
  isBuiltIn: true,
  objectId: (new ObjectId('LabelSpreadi')).toHexString(),
  usableAsSampler: true,
  // id: 'LabelSpreading-81419641',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/LabelSpreading`,
  // isLocal: true,
}];

export const dataObjectSelectionMethods: DataObjectSelectionMethod[] = [{
  name: 'Projection (User Sampling)',
  isServerless: true,
  isAlgorithmic: false,
  api: 'Projection',
  inputs: ['features', 'labels'],
  isBuiltIn: true,
  id: 'Projection',
}, {
  name: 'Random (Dummy)',
  isServerless: true,
  isAlgorithmic: true,
  api: 'Random',
  inputs: ['labels'],
  isBuiltIn: true,
  id: 'Random-73417867',
  params: {
    nBatch: {
      value: 48,
      title: 'Selection Batch Size',
      options: [
        { value: 1, text: '1' },
        { value: 4, text: '4' },
        { value: 16, text: '16' },
        { value: 32, text: '32' },
        { value: 48, text: '48' },
        { value: 64, text: '64' },
        { value: 96, text: '96' },
      ],
    },
  },
}, {
  name: 'Cluster (Clustering)',
  isServerless: false,
  isAlgorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/Cluster`,
  inputs: ['features', 'labels'],
  isBuiltIn: true,
  id: 'Cluster-13466955',
  params: {
    nBatch: {
      value: 48,
      title: 'Selection Batch Size',
      options: [
        { value: 1, text: '1' },
        { value: 4, text: '4' },
        { value: 16, text: '16' },
        { value: 32, text: '32' },
        { value: 48, text: '48' },
        { value: 64, text: '64' },
        { value: 96, text: '96' },
      ],
    },
  },
}, {
  name: 'DenseAreas (Clustering)',
  isServerless: false,
  isAlgorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/DenseAreas`,
  inputs: ['features', 'labels'],
  isBuiltIn: true,
  id: 'DenseAreas-67390401',
  params: {
    nBatch: {
      value: 48,
      title: 'Selection Batch Size',
      options: [
        { value: 1, text: '1' },
        { value: 4, text: '4' },
        { value: 16, text: '16' },
        { value: 32, text: '32' },
        { value: 48, text: '48' },
        { value: 64, text: '64' },
        { value: 96, text: '96' },
      ],
    },
  },
}, {
  name: 'ClusterCentroids (Clustering)',
  isServerless: false,
  isAlgorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/ClusterCentroids`,
  inputs: ['features', 'labels'],
  isBuiltIn: true,
  id: 'ClusterCentroids-60587176',
  params: {
    nBatch: {
      value: 48,
      title: 'Selection Batch Size',
      options: [
        { value: 1, text: '1' },
        { value: 4, text: '4' },
        { value: 16, text: '16' },
        { value: 32, text: '32' },
        { value: 48, text: '48' },
        { value: 64, text: '64' },
        { value: 96, text: '96' },
      ],
    },
  },
}, {
  name: 'Entropy (Active Learning)',
  isServerless: false,
  isAlgorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/Entropy`,
  inputs: ['features', 'labels', 'model'],
  isBuiltIn: true,
  id: 'Entropy-49394355',
  params: {
    nBatch: {
      value: 48,
      title: 'Selection Batch Size',
      options: [
        { value: 1, text: '1' },
        { value: 4, text: '4' },
        { value: 16, text: '16' },
        { value: 32, text: '32' },
        { value: 48, text: '48' },
        { value: 64, text: '64' },
        { value: 96, text: '96' },
      ],
    },
  },
}, {
  name: 'LeastConfident (Active Learning)',
  isServerless: false,
  isAlgorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/LeastConfident`,
  inputs: ['features', 'labels', 'model'],
  isBuiltIn: true,
  id: 'LeastConfident-12520162',
  params: {
    nBatch: {
      value: 48,
      title: 'Selection Batch Size',
      options: [
        { value: 1, text: '1' },
        { value: 4, text: '4' },
        { value: 16, text: '16' },
        { value: 32, text: '32' },
        { value: 48, text: '48' },
        { value: 64, text: '64' },
        { value: 96, text: '96' },
      ],
    },
  },
}, {
  name: 'SmallestMargin (Active Learning)',
  isServerless: false,
  isAlgorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/SmallestMargin`,
  inputs: ['features', 'labels', 'model'],
  isBuiltIn: true,
  id: 'SmallestMargin-74021796',
  params: {
    nBatch: {
      value: 48,
      title: 'Selection Batch Size',
      options: [
        { value: 1, text: '1' },
        { value: 4, text: '4' },
        { value: 16, text: '16' },
        { value: 32, text: '32' },
        { value: 48, text: '48' },
        { value: 64, text: '64' },
        { value: 96, text: '96' },
      ],
    },
  },
}, {
  name: 'EntropyDiversity (Active Learning)',
  isServerless: false,
  isAlgorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/EntropyDiversity`,
  inputs: ['features', 'labels', 'model'],
  isBuiltIn: true,
  id: 'EntropyDiversity-98931757',
  params: {
    nBatch: {
      value: 48,
      title: 'Selection Batch Size',
      options: [
        { value: 1, text: '1' },
        { value: 4, text: '4' },
        { value: 16, text: '16' },
        { value: 32, text: '32' },
        { value: 48, text: '48' },
        { value: 64, text: '64' },
        { value: 96, text: '96' },
      ],
    },
  },
}, {
  name: 'EntropyDiversityDensity (Active Learning)',
  isServerless: false,
  isAlgorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/EntropyDiversityDensity`,
  inputs: ['features', 'labels', 'model'],
  isBuiltIn: true,
  id: 'EntropyDiversityDensity-60957928',
  params: {
    nBatch: {
      value: 48,
      title: 'Selection Batch Size',
      options: [
        { value: 1, text: '1' },
        { value: 4, text: '4' },
        { value: 16, text: '16' },
        { value: 32, text: '32' },
        { value: 48, text: '48' },
        { value: 64, text: '64' },
        { value: 96, text: '96' },
      ],
    },
  },
}];

export const defaultLabelingMethods: DefaultLabelingMethod[] = [{
  name: 'ModelPrediction',
  isServerless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/defaultLabels/ModelPrediction`,
  inputs: ['features', 'model'],
  isBuiltIn: true,
  id: 'ModelPrediction-29967546',
}, {
  name: 'Null (Dummy)',
  isServerless: true,
  api: 'Null',
  inputs: ['features'],
  isBuiltIn: true,
  id: 'Null-35514905',
}, {
  name: 'Random (Dummy)',
  isServerless: true,
  api: 'Random',
  inputs: ['features'],
  isBuiltIn: true,
  id: 'Random-38398168',
}];

export const featureExtractionMethods: FeatureExtractionMethod[] = [{
  name: 'SVD (Unsupervised)',
  isServerless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/features/image/SVD`,
  inputs: ['dataObjects'],
  isBuiltIn: true,
  id: 'image-SVD-25940167',
}, {
  name: 'BoW (Handcrafted)',
  isServerless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/features/image/BoW`,
  inputs: ['dataObjects'],
  isBuiltIn: true,
  id: 'image-BoW-6989392',
}, {
  name: 'LDA (Supervised)',
  isServerless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/features/image/LDA`,
  inputs: ['dataObjects', 'labels'],
  isBuiltIn: true,
  id: 'image-LDA-45100847',
}, {
  name: 'Random3D (Dummy)',
  isServerless: true,
  api: 'Random3D',
  inputs: ['dataObjects'],
  isBuiltIn: true,
  id: 'Random-87333124',
}];

export const interactiveLabelingMethods: InteractiveLabelingMethod[] = [{
  name: 'Single Object Display',
  inputs: ['dataObjects', 'samples'],
  isBuiltIn: true,
  id: 'Single-Object-Display',
}, {
  name: 'Grid Matrix',
  inputs: ['dataObjects', 'samples'],
  isBuiltIn: true,
  id: 'Grid-Matrix',
  params: {
    nRows: {
      value: 6,
      title: 'Number of Objects per Column',
      options: [
        { value: 1, text: '1' },
        { value: 2, text: '2' },
        { value: 4, text: '4' },
        { value: 6, text: '6' },
        { value: 8, text: '8' },
      ],
    },
    nColumns: {
      value: 8,
      title: 'Number of Objects per Row',
      options: [
        { value: 1, text: '1' },
        { value: 4, text: '4' },
        { value: 8, text: '8' },
        { value: 12, text: '12' },
      ],
    },
  },
}];

export const interimModelTrainingMethods: InterimModelTrainingMethod[] = [{
  name: 'Retrain',
  isServerless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/modelUpdated/Retrain`,
  inputs: ['features', 'labels', 'model'],
  isBuiltIn: true,
  id: 'Retrain-16440841',
}, {
  name: 'Static',
  isServerless: true,
  api: 'Static',
  inputs: ['model'],
  isBuiltIn: true,
  id: 'Static-72885436',
}];

export const stoppageAnalysisMethods: StoppageAnalysisMethod[] = [{
  name: 'AllChecked',
  isServerless: true,
  api: 'AllChecked',
  inputs: ['labels'],
  isBuiltIn: true,
  id: 'AllChecked-46322013',
}];

export const taskTransformationMethods: TaskTransformationMethod[] = [{
  name: 'DirectLabeling',
  inputs: ['dataObjects', 'labelTask', 'labelSpace'],
  isBuiltIn: true,
  id: 'DirectLabeling-97377357',
}];

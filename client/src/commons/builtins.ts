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
  serverless: false,
  type: 'DecisionTree',
  isBuiltIn: true,
  objectId: (new ObjectId('DecisionTree')).toHexString(),
  usableAsSampler: false,
  // id: 'DecisionTree-95912701',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/DecisionTree`,
  // isLocal: true,
}, {
  name: 'SVM (Supervised)',
  serverless: false,
  type: 'SVM',
  isBuiltIn: true,
  objectId: (new ObjectId('SVM000000000')).toHexString(),
  usableAsSampler: false,
  // id: 'SVM-99885399',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/SVM`,
  // isLocal: true,
}, {
  name: 'LogisticRegression (Supervised)',
  serverless: false,
  type: 'LogisticRegression',
  isBuiltIn: true,
  objectId: (new ObjectId('LogisticRegr')).toHexString(),
  usableAsSampler: true,
  // id: 'LogisticRegression-75095119',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/LogisticRegression`,
  // isLocal: true,
}, {
  name: 'RestrictedBoltzmannMachine (Supervised)',
  serverless: false,
  type: 'RestrictedBoltzmannMachine',
  isBuiltIn: true,
  objectId: (new ObjectId('RestrictedBo')).toHexString(),
  usableAsSampler: false,
  // id: 'RestrictedBoltzmannMachine-73157581',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/RestrictedBoltzmannMachine`,
  // isLocal: true,
}, {
  name: 'LabelSpreading (Semi-Supervised)',
  serverless: false,
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
  serverless: true,
  algorithmic: false,
  api: 'Projection',
  parameters: ['features', 'labels'],
  isBuiltIn: true,
  id: 'Projection',
}, {
  name: 'Random (Dummy)',
  serverless: true,
  algorithmic: true,
  api: 'Random',
  parameters: ['labels'],
  isBuiltIn: true,
  id: 'Random-73417867',
  configuration: {
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
  serverless: false,
  algorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/Cluster`,
  parameters: ['features', 'labels'],
  isBuiltIn: true,
  id: 'Cluster-13466955',
  configuration: {
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
  serverless: false,
  algorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/DenseAreas`,
  parameters: ['features', 'labels'],
  isBuiltIn: true,
  id: 'DenseAreas-67390401',
  configuration: {
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
  serverless: false,
  algorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/ClusterCentroids`,
  parameters: ['features', 'labels'],
  isBuiltIn: true,
  id: 'ClusterCentroids-60587176',
  configuration: {
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
  serverless: false,
  algorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/Entropy`,
  parameters: ['features', 'labels', 'model'],
  isBuiltIn: true,
  id: 'Entropy-49394355',
  configuration: {
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
  serverless: false,
  algorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/LeastConfident`,
  parameters: ['features', 'labels', 'model'],
  isBuiltIn: true,
  id: 'LeastConfident-12520162',
  configuration: {
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
  serverless: false,
  algorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/SmallestMargin`,
  parameters: ['features', 'labels', 'model'],
  isBuiltIn: true,
  id: 'SmallestMargin-74021796',
  configuration: {
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
  serverless: false,
  algorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/EntropyDiversity`,
  parameters: ['features', 'labels', 'model'],
  isBuiltIn: true,
  id: 'EntropyDiversity-98931757',
  configuration: {
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
  serverless: false,
  algorithmic: true,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/selection/EntropyDiversityDensity`,
  parameters: ['features', 'labels', 'model'],
  isBuiltIn: true,
  id: 'EntropyDiversityDensity-60957928',
  configuration: {
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
  serverless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/defaultLabels/ModelPrediction`,
  parameters: ['features', 'model'],
  isBuiltIn: true,
  id: 'ModelPrediction-29967546',
}, {
  name: 'Null (Dummy)',
  serverless: true,
  api: 'Null',
  parameters: ['features'],
  isBuiltIn: true,
  id: 'Null-35514905',
}, {
  name: 'Random (Dummy)',
  serverless: true,
  api: 'Random',
  parameters: ['features'],
  isBuiltIn: true,
  id: 'Random-38398168',
}];

export const featureExtractionMethods: FeatureExtractionMethod[] = [{
  name: 'SVD (Unsupervised)',
  serverless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/features/image/SVD`,
  parameters: ['dataObjects'],
  isBuiltIn: true,
  id: 'image-SVD-25940167',
}, {
  name: 'BoW (Handcrafted)',
  serverless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/features/image/BoW`,
  parameters: ['dataObjects'],
  isBuiltIn: true,
  id: 'image-BoW-6989392',
}, {
  name: 'LDA (Supervised)',
  serverless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/features/image/LDA`,
  parameters: ['dataObjects', 'labels'],
  isBuiltIn: true,
  id: 'image-LDA-45100847',
}, {
  name: 'Random3D (Dummy)',
  serverless: true,
  api: 'Random3D',
  parameters: ['dataObjects'],
  isBuiltIn: true,
  id: 'Random-87333124',
}];

export const interactiveLabelingMethods: InteractiveLabelingMethod[] = [{
  name: 'Single Object Display',
  parameters: ['dataObjects', 'samples'],
  isBuiltIn: true,
  id: 'Single-Object-Display',
}, {
  name: 'Grid Matrix',
  parameters: ['dataObjects', 'samples'],
  isBuiltIn: true,
  id: 'Grid-Matrix',
  configuration: {
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
  serverless: false,
  api: `${PROTOCOL}://${IP}:${SERVER_PORT}/modelUpdated/Retrain`,
  parameters: ['features', 'labels', 'model'],
  isBuiltIn: true,
  id: 'Retrain-16440841',
}, {
  name: 'Static',
  serverless: true,
  api: 'Static',
  parameters: ['model'],
  isBuiltIn: true,
  id: 'Static-72885436',
}];

export const stoppageAnalysisMethods: StoppageAnalysisMethod[] = [{
  name: 'AllChecked',
  serverless: true,
  api: 'AllChecked',
  parameters: ['labels'],
  isBuiltIn: true,
  id: 'AllChecked-46322013',
}];

export const taskTransformationMethods: TaskTransformationMethod[] = [{
  name: 'DirectLabeling',
  parameters: ['dataObjects', 'labelTask', 'labelSpace'],
  isBuiltIn: true,
  id: 'DirectLabeling-97377357',
}];

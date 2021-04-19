import ObjectId from 'bson-objectid';
import {
  ModelService,
  FeatureExtractionMethod,
  DefaultLabelingMethod,
  InterimModelTrainingMethod,
  InteractiveLabelingMethod,
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
  // id: 'DecisionTree-95912701',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/DecisionTree`,
  // isLocal: true,
}, {
  name: 'SVM (Supervised)',
  serverless: false,
  type: 'SVM',
  isBuiltIn: true,
  objectId: (new ObjectId('SVM000000000')).toHexString(),
  // id: 'SVM-99885399',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/SVM`,
  // isLocal: true,
}, {
  name: 'LogisticRegression (Supervised)',
  serverless: false,
  type: 'LogisticRegression',
  isBuiltIn: true,
  objectId: (new ObjectId('LogisticRegr')).toHexString(),
  // id: 'LogisticRegression-75095119',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/LogisticRegression`,
  // isLocal: true,
}, {
  name: 'RestrictedBoltzmannMachine (Supervised)',
  serverless: false,
  type: 'RestrictedBoltzmannMachine',
  isBuiltIn: true,
  objectId: (new ObjectId('RestrictedBo')).toHexString(),
  // id: 'RestrictedBoltzmannMachine-73157581',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/RestrictedBoltzmannMachine`,
  // isLocal: true,
}, {
  name: 'LabelSpreading (Semi-Supervised)',
  serverless: false,
  type: 'LabelSpreading',
  isBuiltIn: true,
  objectId: (new ObjectId('LabelSpreadi')).toHexString(),
  // id: 'LabelSpreading-81419641',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/LabelSpreading`,
  // isLocal: true,
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
    nRows: 6,
    nColumns: 8,
  },
}];

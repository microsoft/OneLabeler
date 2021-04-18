import ObjectId from 'bson-objectid';
import {
  DataType,
  LabelTaskType,
  SamplingStrategyType,
  TaskTransformationType,
  StoppageAnalysisType,
  InterimModelTrainingType,
  ModelService,
  FeatureExtractionMethod,
  DefaultLabelingMethod,
} from '@/commons/types';
import {
  PROTOCOL,
  IP,
  SERVER_PORT,
} from '@/services/http-params';

export interface IState {
  /** The concerned data object type. */
  dataType: DataType,
  /** The concerned data labeling tasks. */
  labelTasks: LabelTaskType[],
  /** The collection of model services. */
  modelServices: ModelService[],
  /** The collection of feature extraction methods. */
  featureExtractionMethods: FeatureExtractionMethod[],
  featureExtractionMethod: FeatureExtractionMethod,
  /** The data sampling strategy. */
  samplingStrategy: SamplingStrategyType,
  /** The number of data objects to sample each time. */
  nBatch: number,
  /** The collection of default labeling methods. */
  defaultLabelingMethods: DefaultLabelingMethod[],
  /** The default labeling model. */
  defaultLabelingMethod: DefaultLabelingMethod,
  defaultLabelingModel: ModelService | null,
  /** Whether to show the dataset overview. */
  showDatasetOverview: boolean,
  /** The task the labeler is instructed to carry out. */
  taskTransformation: TaskTransformationType,
  /** Whether to show single object display. */
  singleObjectDisplayEnabled: boolean,
  /** Whether to show grid matrix. */
  gridMatrixEnabled: boolean,
  /** The number of data objects per row in the thumbnail matrix. */
  itemsPerRow: number,
  /** The number of data objects per column in the thumbnail matrix. */
  itemsPerCol: number,
  /** The stoppage analysis method. */
  stoppageAnalysis: StoppageAnalysisType,
  /** Whether to enable interim model training. */
  interimModelTrainingEnabled: boolean,
  /** The interim model training method. */
  interimModelTraining: InterimModelTrainingType,
}

const modelServices: ModelService[] = [{
  name: 'DecisionTree (Supervised)',
  serverless: false,
  type: 'DecisionTree',
  isBuiltIn: true,
  objectId: (new ObjectId()).toHexString(),
  // id: 'DecisionTree-95912701',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/DecisionTree`,
  // isLocal: true,
}, {
  name: 'SVM (Supervised)',
  serverless: false,
  type: 'SVM',
  isBuiltIn: true,
  objectId: (new ObjectId()).toHexString(),
  // id: 'SVM-99885399',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/SVM`,
  // isLocal: true,
}, {
  name: 'LogisticRegression (Supervised)',
  serverless: false,
  type: 'LogisticRegression',
  isBuiltIn: true,
  objectId: (new ObjectId()).toHexString(),
  // id: 'LogisticRegression-75095119',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/LogisticRegression`,
  // isLocal: true,
}, {
  name: 'RestrictedBoltzmannMachine (Supervised)',
  serverless: false,
  type: 'RestrictedBoltzmannMachine',
  isBuiltIn: true,
  objectId: (new ObjectId()).toHexString(),
  // id: 'RestrictedBoltzmannMachine-73157581',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/RestrictedBoltzmannMachine`,
  // isLocal: true,
}, {
  name: 'LabelSpreading (Semi-Supervised)',
  serverless: false,
  type: 'LabelSpreading',
  isBuiltIn: true,
  objectId: (new ObjectId()).toHexString(),
  // id: 'LabelSpreading-81419641',
  // api: `${PROTOCOL}://${IP}:${SERVER_PORT}/model/LabelSpreading`,
  // isLocal: true,
}];

const featureExtractionMethods: FeatureExtractionMethod[] = [{
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

const defaultLabelingMethods: DefaultLabelingMethod[] = [{
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

export const createInitialState = (): IState => ({
  dataType: DataType.Image,
  labelTasks: [], // [LabelTaskType.Classification],
  modelServices,
  featureExtractionMethods,
  featureExtractionMethod: {
    name: 'SVD (Unsupervised)',
    serverless: false,
    api: `${PROTOCOL}://${IP}:${SERVER_PORT}/features/image/SVD`,
    parameters: ['dataObjects'],
    isBuiltIn: true,
    id: 'image-SVD-25940167',
  },
  defaultLabelingMethods,
  defaultLabelingMethod: {
    name: 'Null (Dummy)',
    serverless: true,
    api: 'Null',
    parameters: ['features'],
    isBuiltIn: true,
    id: 'Null-35514905',
  },
  defaultLabelingModel: null,
  samplingStrategy: SamplingStrategyType.Random,
  nBatch: 1,
  showDatasetOverview: false,
  taskTransformation: TaskTransformationType.DirectLabeling,
  singleObjectDisplayEnabled: false,
  gridMatrixEnabled: false,
  itemsPerRow: 8,
  itemsPerCol: 6,
  stoppageAnalysis: StoppageAnalysisType.AllChecked,
  interimModelTrainingEnabled: false,
  interimModelTraining: InterimModelTrainingType.Retrain,
});

export default createInitialState();

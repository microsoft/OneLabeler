import {
  DataType,
  LabelTaskType,
  TaskTransformationType,
  StoppageAnalysisType,
  ModelService,
  FeatureExtractionMethod,
  DefaultLabelingMethod,
  InterimModelTrainingMethod,
  InteractiveLabelingMethod,
  DataObjectSelectionMethod,
} from '@/commons/types';
import {
  modelServices,
  featureExtractionMethods,
  defaultLabelingMethods,
  interimModelTrainingMethods,
  interactiveLabelingMethods,
  dataObjectSelectionMethods,
} from '@/commons/builtins';

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

  /** The collection of default labeling methods. */
  defaultLabelingMethods: DefaultLabelingMethod[],
  /** The default labeling model. */
  defaultLabelingMethod: DefaultLabelingMethod,
  defaultLabelingModel: ModelService | null,

  /** The collection of interim model training methods. */
  interimModelTrainingMethods: InterimModelTrainingMethod[],
  /** The interim model training method. */
  interimModelTrainingMethod: InterimModelTrainingMethod,

  /** The collection of interactive labeling methods. */
  interactiveLabelingMethods: InteractiveLabelingMethod[],
  interactiveLabelingMethod: InteractiveLabelingMethod[],

  /** The collection of data object selection methods. */
  dataObjectSelectionMethods: DataObjectSelectionMethod[],
  dataObjectSelectionMethod: DataObjectSelectionMethod[],
  dataObjectSelectionModel: ModelService | null,

  /** The task the labeler is instructed to carry out. */
  taskTransformation: TaskTransformationType,
  /** The stoppage analysis method. */
  stoppageAnalysis: StoppageAnalysisType,
}

export const createInitialState = (): IState => ({
  dataType: DataType.Image,
  labelTasks: [], // [LabelTaskType.Classification],
  modelServices,
  featureExtractionMethods,
  featureExtractionMethod: featureExtractionMethods
    .find((d) => d.name === 'SVD (Unsupervised)') as FeatureExtractionMethod,
  defaultLabelingMethods,
  defaultLabelingMethod: defaultLabelingMethods
    .find((d) => d.name === 'Null (Dummy)') as DefaultLabelingMethod,
  defaultLabelingModel: null,
  interimModelTrainingMethods,
  interimModelTrainingMethod: interimModelTrainingMethods
    .find((d) => d.name === 'Static') as InterimModelTrainingMethod,
  interactiveLabelingMethods,
  interactiveLabelingMethod: [] as InteractiveLabelingMethod[],
  dataObjectSelectionMethods,
  dataObjectSelectionMethod: [] as DataObjectSelectionMethod[],
  dataObjectSelectionModel: null,
  taskTransformation: TaskTransformationType.DirectLabeling,
  stoppageAnalysis: StoppageAnalysisType.AllChecked,
});

export default createInitialState();

import {
  DataType,
  LabelTaskType,
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
  modelServices,
  dataObjectSelectionMethods,
  defaultLabelingMethods,
  featureExtractionMethods,
  interactiveLabelingMethods,
  interimModelTrainingMethods,
  stoppageAnalysisMethods,
  taskTransformationMethods,
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

  /** The collection of task transformation methods. */
  taskTransformationMethods: TaskTransformationMethod[],
  taskTransformationMethod: TaskTransformationMethod,

  /** The collection of stoppage analysis methods. */
  stoppageAnalysisMethods: StoppageAnalysisMethod[],
  stoppageAnalysisMethod: StoppageAnalysisMethod,
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
  taskTransformationMethods,
  taskTransformationMethod: taskTransformationMethods
    .find((d) => d.name === 'DirectLabeling') as TaskTransformationMethod,
  stoppageAnalysisMethods,
  stoppageAnalysisMethod: stoppageAnalysisMethods
    .find((d) => d.name === 'AllChecked') as StoppageAnalysisMethod,
});

export default createInitialState();

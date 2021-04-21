import {
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
import { IState } from './state';
import * as types from './mutation-types';

export default {
  [types.SET_LABEL_TASKS](
    state: IState,
    labelTasks: LabelTaskType[],
  ): void {
    state.labelTasks = labelTasks;
  },
  [types.SET_MODEL_SERVICES](
    state: IState,
    services: ModelService[],
  ): void {
    state.modelServices = services;
  },
  [types.SET_DATA_OBJECT_SELECTION_METHODS](
    state: IState,
    methods: DataObjectSelectionMethod[],
  ): void {
    state.dataObjectSelectionMethods = methods;
  },
  [types.SET_DATA_OBJECT_SELECTION_METHOD](
    state: IState,
    method: DataObjectSelectionMethod[],
  ): void {
    state.dataObjectSelectionMethod = method;
  },
  [types.SET_DATA_OBJECT_SELECTION_MODEL](
    state: IState,
    model: ModelService,
  ): void {
    state.dataObjectSelectionModel = model;
  },
  [types.SET_DEFAULT_LABELING_METHODS](
    state: IState,
    methods: DefaultLabelingMethod[],
  ): void {
    state.defaultLabelingMethods = methods;
  },
  [types.SET_DEFAULT_LABELING_METHOD](
    state: IState,
    method: DefaultLabelingMethod,
  ): void {
    state.defaultLabelingMethod = method;
  },
  [types.SET_DEFAULT_LABELING_MODEL](
    state: IState,
    model: ModelService,
  ): void {
    state.defaultLabelingModel = model;
  },
  [types.SET_FEATURE_EXTRACTION_METHODS](
    state: IState,
    methods: FeatureExtractionMethod[],
  ): void {
    state.featureExtractionMethods = methods;
  },
  [types.SET_FEATURE_EXTRACTION_METHOD](
    state: IState,
    method: FeatureExtractionMethod,
  ): void {
    state.featureExtractionMethod = method;
  },
  [types.SET_INTERACTIVE_LABELING_METHODS](
    state: IState,
    methods: InteractiveLabelingMethod[],
  ): void {
    state.interactiveLabelingMethods = methods;
  },
  [types.SET_INTERACTIVE_LABELING_METHOD](
    state: IState,
    method: InteractiveLabelingMethod[],
  ): void {
    state.interactiveLabelingMethod = method;
  },
  [types.SET_INTERIM_MODEL_TRAINING_METHODS](
    state: IState,
    methods: InterimModelTrainingMethod[],
  ): void {
    state.interimModelTrainingMethods = methods;
  },
  [types.SET_INTERIM_MODEL_TRAINING_METHOD](
    state: IState,
    method: InterimModelTrainingMethod,
  ): void {
    state.interimModelTrainingMethod = method;
  },
  [types.SET_STOPPAGE_ANALYSIS_METHODS](
    state: IState,
    methods: StoppageAnalysisMethod[],
  ): void {
    state.stoppageAnalysisMethods = methods;
  },
  [types.SET_STOPPAGE_ANALYSIS_METHOD](
    state: IState,
    method: StoppageAnalysisMethod,
  ): void {
    state.stoppageAnalysisMethod = method;
  },
  [types.SET_TASK_TRANSFORMATION_METHODS](
    state: IState,
    methods: TaskTransformationMethod[],
  ): void {
    state.taskTransformationMethods = methods;
  },
  [types.SET_TASK_TRANSFORMATION_METHOD](
    state: IState,
    method: TaskTransformationMethod,
  ): void {
    state.taskTransformationMethod = method;
  },
};

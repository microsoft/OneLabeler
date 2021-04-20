import {
  ModelService,
  DefaultLabelingMethod,
  FeatureExtractionMethod,
  InterimModelTrainingMethod,
  LabelTaskType,
  InteractiveLabelingMethod,
  DataObjectSelectionMethod,
} from '@/commons/types';
import { IState } from './state';
import * as types from './mutation-types';

export default {
  [types.SET_LABEL_TASKS](state: IState, labelTasks: LabelTaskType[]): void {
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
};

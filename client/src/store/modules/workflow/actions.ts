import { ActionContext } from 'vuex';
import * as API from '@/services/data-labeling-api';
import {
  IImage,
  Status,
  LabelTaskType,
  ModelService,
  DataObjectSelectionMethod,
  DefaultLabelingMethod,
  FeatureExtractionMethod,
  InterimModelTrainingMethod,
  InteractiveLabelingMethod,
  StoppageAnalysisMethod,
  TaskTransformationMethod,
} from '@/commons/types';
import * as types from './mutation-types';
import * as rootTypes from '../mutation-types';
import { IState, createInitialState } from './state';
import { IState as IRootState } from '../state';

export const executeInterimModelTraining = async (
  { commit, state, rootState }: ActionContext<IState, IRootState>,
  { method, model }: { method: DefaultLabelingMethod, model: ModelService },
): Promise<void> => {
  const {
    dataObjects,
    labels,
    statuses,
  } = rootState;
  const { defaultLabelingModel } = state;
  const modelUpdated = (await API.interimModelTraining(
    method,
    defaultLabelingModel as ModelService,
    dataObjects,
    labels,
    statuses,
  ));
  commit(types.SET_DEFAULT_LABELING_MODEL, modelUpdated);
};

export const executeDataObjectSelectionAlgorithmic = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  { method, model }: { method: DataObjectSelectionMethod, model: ModelService },
): Promise<void> => {
  const {
    labels,
    statuses,
    queryIndices,
    unlabeledMark,
  } = rootState;

  // Set the labels of samples in the last batch confirmed
  const newStatuses = [...statuses];
  queryIndices.forEach((index: number) => {
    const isUnlabeled = labels[index] === unlabeledMark;
    newStatuses[index] = isUnlabeled ? Status.Skipped : Status.Labeled;
  });

  // Sample data objects.
  const { dataObjects } = rootState;
  const nBatch = method.params.nBatch.value;
  const newQueryIndices = (await API.dataObjectSelection(
    method,
    labels,
    statuses,
    nBatch,
    model,
    dataObjects,
  ));
  commit(rootTypes.SET_QUERY_INDICES, newQueryIndices, { root: true });

  // Set the labels of samples in the current batch viewed.
  newQueryIndices.forEach((index: number) => {
    newStatuses[index] = Status.Viewed;
  });
  commit(rootTypes.SET_STATUSES, newStatuses, { root: true });
};

export const executeDataObjectSelectionManual = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  newQueryIndices: number[],
): Promise<void> => {
  const {
    labels,
    statuses,
    queryIndices,
    unlabeledMark,
  } = rootState;

  // Set the labels of samples in the last batch confirmed
  const newStatuses = [...statuses];
  queryIndices.forEach((index: number) => {
    const isUnlabeled = labels[index] === unlabeledMark;
    newStatuses[index] = isUnlabeled ? Status.Skipped : Status.Labeled;
  });

  // Sample data objects.
  commit(rootTypes.SET_QUERY_INDICES, newQueryIndices, { root: true });

  // Set the labels of samples in the current batch viewed.
  newQueryIndices.forEach((index: number) => {
    newStatuses[index] = Status.Viewed;
  });
  commit(rootTypes.SET_STATUSES, newStatuses, { root: true });
};

export const executeDefaultLabeling = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  { method, model }: { method: DefaultLabelingMethod, model: ModelService },
): Promise<void> => {
  const {
    dataObjects,
    queryIndices,
    classes,
    unlabeledMark,
  } = rootState;
  const sampledDataObjects = queryIndices.map((d) => dataObjects[d]);
  const uuids = sampledDataObjects.map((d) => d.uuid);
  const labels = (await API.defaultLabeling(
    method,
    sampledDataObjects,
    model,
    classes,
    unlabeledMark,
  ));
  commit(rootTypes.SET_DATA_OBJECT_LABELS, {
    uuids,
    labels,
    inQueryIndices: true,
  }, { root: true });
};

export const executeFeatureExtraction = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  { method }: { method: FeatureExtractionMethod },
): Promise<void> => {
  const { dataObjects, labels, statuses } = rootState;

  if (dataObjects === null) return;

  const requireLabels = method.inputs
    .findIndex((d) => d === 'labels') >= 0;

  if (requireLabels && (labels.length === 0)) return;

  const response = requireLabels
    ? (await API.featureExtraction(method, dataObjects as IImage[], labels, statuses))
    : (await API.featureExtraction(method, dataObjects as IImage[]));

  commit(rootTypes.SET_DATA_OBJECTS, response.dataObjects, { root: true });
  commit(rootTypes.SET_FEATURE_NAMES, response.featureNames, { root: true });
};

export const setLabelTasks = (
  { commit, state, rootState }: ActionContext<IState, IRootState>,
  labelTasks: LabelTaskType[],
): void => {
  const labelTasksOld = state.labelTasks;
  const { dataObjects, unlabeledMark } = rootState;
  commit(types.SET_LABEL_TASKS, labelTasks);

  // Initialize labels for new tasks, and reset labels for deleted tasks.
  const enableImageClassificationOld = labelTasksOld.findIndex(
    (d) => d === LabelTaskType.Classification,
  ) >= 0;
  const enableImageClassification = labelTasks.findIndex(
    (d) => d === LabelTaskType.Classification,
  ) >= 0;
  const enableObjectDetectionOld = labelTasksOld.findIndex(
    (d) => d === LabelTaskType.ObjectDetection,
  ) >= 0;
  const enableObjectDetection = labelTasks.findIndex(
    (d) => d === LabelTaskType.ObjectDetection,
  ) >= 0;
  const enableImageSegmentationOld = labelTasksOld.findIndex(
    (d) => d === LabelTaskType.Segmentation,
  ) >= 0;
  const enableImageSegmentation = labelTasks.findIndex(
    (d) => d === LabelTaskType.Segmentation,
  ) >= 0;

  if (!enableImageClassification) {
    commit(rootTypes.SET_LABELS, [], { root: true });
  }
  if (!enableImageClassificationOld && enableImageClassification) {
    const labels = Array(dataObjects.length).fill(unlabeledMark);
    commit(rootTypes.SET_LABELS, labels, { root: true });
  }
  if (!enableObjectDetection) {
    commit(rootTypes.SET_LABEL_GEOMETRIC_OBJECTS, [], { root: true });
  }
  if (!enableObjectDetectionOld && enableObjectDetection) {
    const labelGeometricObjects = Array(dataObjects.length).fill(null).map(() => Array(0));
    commit(rootTypes.SET_LABEL_GEOMETRIC_OBJECTS, labelGeometricObjects, { root: true });
  }
  if (!enableImageSegmentation) {
    commit(rootTypes.SET_LABEL_MASKS, [], { root: true });
  }
  if (!enableImageSegmentationOld && enableImageSegmentation) {
    const labelMasks = Array(dataObjects.length).fill(null).map(() => ({
      path: null,
    }));
    commit(rootTypes.SET_LABEL_MASKS, labelMasks, { root: true });
  }
};

export const setModelServices = (
  { commit }: ActionContext<IState, IRootState>,
  services: ModelService[],
): void => {
  commit(types.SET_MODEL_SERVICES, services);
};

export const setDataObjectSelectionMethods = (
  { commit }: ActionContext<IState, IRootState>,
  methods: DataObjectSelectionMethod[],
): void => {
  commit(types.SET_DATA_OBJECT_SELECTION_METHODS, methods);
};

export const setDataObjectSelectionMethod = (
  { commit }: ActionContext<IState, IRootState>,
  method: DataObjectSelectionMethod[],
): void => {
  commit(types.SET_DATA_OBJECT_SELECTION_METHOD, method);
};

export const setDataObjectSelectionModel = (
  { commit }: ActionContext<IState, IRootState>,
  model: ModelService,
): void => {
  commit(types.SET_DATA_OBJECT_SELECTION_MODEL, model);
};

export const setDefaultLabelingMethods = (
  { commit }: ActionContext<IState, IRootState>,
  methods: DefaultLabelingMethod[],
): void => {
  commit(types.SET_DEFAULT_LABELING_METHODS, methods);
};

export const setDefaultLabelingMethod = (
  { commit }: ActionContext<IState, IRootState>,
  method: DefaultLabelingMethod,
): void => {
  commit(types.SET_DEFAULT_LABELING_METHOD, method);
};

export const setDefaultLabelingModel = (
  { commit }: ActionContext<IState, IRootState>,
  model: ModelService,
): void => {
  commit(types.SET_DEFAULT_LABELING_MODEL, model);
};

export const setFeatureExtractionMethods = (
  { commit }: ActionContext<IState, IRootState>,
  methods: FeatureExtractionMethod[],
): void => {
  commit(types.SET_FEATURE_EXTRACTION_METHODS, methods);
};

export const setFeatureExtractionMethod = (
  { commit, state }: ActionContext<IState, IRootState>,
  method: FeatureExtractionMethod,
): void => {
  if (state.featureExtractionMethod === method) {
    return;
  }
  commit(types.SET_FEATURE_EXTRACTION_METHOD, method);
};

export const setInteractiveLabelingMethods = (
  { commit }: ActionContext<IState, IRootState>,
  methods: InteractiveLabelingMethod[],
): void => {
  commit(types.SET_INTERACTIVE_LABELING_METHODS, methods);
};

export const setInteractiveLabelingMethod = (
  { commit }: ActionContext<IState, IRootState>,
  method: InteractiveLabelingMethod[],
): void => {
  commit(types.SET_INTERACTIVE_LABELING_METHOD, method);
};

export const setInterimModelTrainingMethods = (
  { commit }: ActionContext<IState, IRootState>,
  methods: InterimModelTrainingMethod[],
): void => {
  commit(types.SET_INTERIM_MODEL_TRAINING_METHODS, methods);
};

export const setInterimModelTrainingMethod = (
  { commit }: ActionContext<IState, IRootState>,
  method: InterimModelTrainingMethod,
): void => {
  commit(types.SET_INTERIM_MODEL_TRAINING_METHOD, method);
};

export const setStoppageAnalysisMethods = (
  { commit }: ActionContext<IState, IRootState>,
  methods: StoppageAnalysisMethod[],
): void => {
  commit(types.SET_STOPPAGE_ANALYSIS_METHODS, methods);
};

export const setStoppageAnalysisMethod = (
  { commit }: ActionContext<IState, IRootState>,
  method: StoppageAnalysisMethod,
): void => {
  commit(types.SET_STOPPAGE_ANALYSIS_METHOD, method);
};

export const setTaskTransformationMethods = (
  { commit }: ActionContext<IState, IRootState>,
  methods: TaskTransformationMethod[],
): void => {
  commit(types.SET_TASK_TRANSFORMATION_METHODS, methods);
};

export const setTaskTransformationMethod = (
  { commit }: ActionContext<IState, IRootState>,
  method: TaskTransformationMethod,
): void => {
  commit(types.SET_TASK_TRANSFORMATION_METHOD, method);
};

export const extractDataObjects = async (
  { commit, state, rootState }: ActionContext<IState, IRootState>,
  files: FileList,
): Promise<void> => {
  const { labelTasks } = state;
  const { unlabeledMark } = rootState;

  // Extract data objects.
  const dataObjects = (await API.extractDataObjects(files));
  commit(rootTypes.SET_DATA_OBJECTS, dataObjects, { root: true });

  // Initialize labels and label statuses.
  const enableImageClassification = labelTasks.findIndex(
    (d) => d === LabelTaskType.Classification,
  ) >= 0;
  const enableObjectDetection = labelTasks.findIndex(
    (d) => d === LabelTaskType.ObjectDetection,
  ) >= 0;
  const enableImageSegmentation = labelTasks.findIndex(
    (d) => d === LabelTaskType.Segmentation,
  ) >= 0;
  if (enableImageClassification) {
    const labels = Array(dataObjects.length).fill(unlabeledMark);
    commit(rootTypes.SET_LABELS, labels, { root: true });
  }
  if (enableObjectDetection) {
    const labelGeometricObjects = Array(dataObjects.length).fill(null).map(() => Array(0));
    commit(rootTypes.SET_LABEL_GEOMETRIC_OBJECTS, labelGeometricObjects, { root: true });
  }
  if (enableImageSegmentation) {
    const labelMasks = Array(dataObjects.length).fill(null).map(() => ({
      path: null,
    }));
    commit(rootTypes.SET_LABEL_MASKS, labelMasks, { root: true });
  }
  const statuses = Array(dataObjects.length).fill(Status.New);
  commit(rootTypes.SET_STATUSES, statuses, { root: true });
};

export const resetState = (
  { commit }: ActionContext<IState, IRootState>,
): void => {
  const {
    defaultLabelingMethod,
  } = createInitialState();
  commit(types.SET_DEFAULT_LABELING_METHOD, defaultLabelingMethod);
};

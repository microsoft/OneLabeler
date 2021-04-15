import { ActionContext } from 'vuex';
import * as API from '@/services/data-labeling-api';
import {
  DefaultLabelingMethodType,
  IImage,
  IModel,
  LabelTaskType,
  FeatureExtractionMethod,
  SamplingStrategyType,
  Status,
} from '@/commons/types';
import * as types from './mutation-types';
import * as rootTypes from '../mutation-types';
import { IState, createInitialState } from './state';
import { IState as IRootState } from '../state';

export const setShowDatasetOverview = (
  { commit }: ActionContext<IState, IRootState>,
  showDatasetOverview: boolean,
): void => {
  commit(types.SET_SHOW_DATASET_OVERVIEW, showDatasetOverview);
};

export const extractFeatures = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  method: FeatureExtractionMethod,
): Promise<void> => {
  const { dataObjects, labels, statuses } = rootState;

  if (dataObjects === null) return;

  const requireLabels = method.parameters
    .findIndex((d) => d === 'labels') >= 0;

  if (requireLabels && (labels.length === 0)) return;

  const response = requireLabels
    ? (await API.extractFeatures(method, dataObjects as IImage[], labels, statuses))
    : (await API.extractFeatures(method, dataObjects as IImage[]));

  commit(rootTypes.SET_DATA_OBJECTS, response.dataObjects, { root: true });
  commit(rootTypes.SET_FEATURE_NAMES, response.featureNames, { root: true });
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

export const setSamplingStrategy = (
  { commit, rootState }: ActionContext<IState, IRootState>,
  samplingStrategy: SamplingStrategyType,
): void => {
  commit(types.SET_SAMPLING_STRATEGY, samplingStrategy);

  const { model } = rootState;
  if (model.samplingStrategy !== samplingStrategy) {
    const modelUpdated: IModel = {
      type: model.type,
      samplingStrategy,
      predictor: model.predictor,
      sampler: model.sampler,
    };
    commit(rootTypes.SET_MODEL, modelUpdated, { root: true });
  }
};

export const setDefaultLabelingMethod = (
  { commit, rootState }: ActionContext<IState, IRootState>,
  defaultLabelingMethod: DefaultLabelingMethodType,
): void => {
  commit(types.SET_DEFAULT_LABELING_METHOD, defaultLabelingMethod);

  // After changing the default labeling model type,
  // reset the current model.
  const { model } = rootState;
  if (model.type !== defaultLabelingMethod) {
    const modelUpdated: IModel = {
      type: defaultLabelingMethod,
      samplingStrategy: model.samplingStrategy,
      predictor: null,
      sampler: model.sampler,
    };
    commit(rootTypes.SET_MODEL, modelUpdated, { root: true });
  }
};

export const setNBatch = (
  { commit }: ActionContext<IState, IRootState>,
  nBatch: number,
): void => {
  commit(types.SET_N_BATCH, nBatch);
};

export const setSingleObjectDisplayEnabled = (
  { commit }: ActionContext<IState, IRootState>,
  enabled: boolean,
): void => {
  commit(types.SET_SINGLE_OBJECT_DISPLAY_ENABLED, enabled);
};

export const setGridMatrixEnabled = (
  { commit }: ActionContext<IState, IRootState>,
  enabled: boolean,
): void => {
  commit(types.SET_GRID_MATRIX_ENABLED, enabled);
};

export const setItemsPerRow = (
  { commit }: ActionContext<IState, IRootState>,
  itemsPerRow: number,
): void => {
  commit(types.SET_ITEMS_PER_ROW, itemsPerRow);
};

export const setItemsPerCol = (
  { commit }: ActionContext<IState, IRootState>,
  itemsPerCol: number,
): void => {
  commit(types.SET_ITEMS_PER_COL, itemsPerCol);
};

export const setInterimModelTrainingEnabled = (
  { commit }: ActionContext<IState, IRootState>,
  enabled: boolean,
): void => {
  commit(types.SET_INTERIM_MODEL_TRAINING_ENABLED, enabled);
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

  commit(types.SET_GRID_MATRIX_ENABLED, enableImageClassification);
  commit(types.SET_SINGLE_OBJECT_DISPLAY_ENABLED,
    enableObjectDetection || enableImageSegmentation);

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
  const statuses = Array(dataObjects.length).fill(Status.NEW);
  commit(rootTypes.SET_STATUSES, statuses, { root: true });
};

export const sampleDataObjectsAlgorithmic = async (
  { commit, state, rootState }: ActionContext<IState, IRootState>,
): Promise<void> => {
  const { nBatch } = state;
  const {
    dataObjects,
    labels,
    statuses,
    queryIndices,
    unlabeledMark,
    model,
  } = rootState;

  // Set the labels of samples in the last batch confirmed
  const newStatuses = [...statuses];
  queryIndices.forEach((index: number) => {
    const isUnlabeled = labels[index] === unlabeledMark;
    newStatuses[index] = isUnlabeled ? Status.SKIPPED : Status.LABELED;
  });

  // Sample data objects.
  const newQueryIndices = (await API.sampleDataObjects(
    dataObjects,
    labels,
    statuses,
    nBatch,
    model,
  ));
  commit(rootTypes.SET_QUERY_INDICES, newQueryIndices, { root: true });

  // Set the labels of samples in the current batch viewed.
  newQueryIndices.forEach((index: number) => {
    newStatuses[index] = Status.VIEWED;
  });
  commit(rootTypes.SET_STATUSES, newStatuses, { root: true });
};

export const sampleDataObjectsManual = async (
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
    newStatuses[index] = isUnlabeled ? Status.SKIPPED : Status.LABELED;
  });

  // Sample data objects.
  commit(rootTypes.SET_QUERY_INDICES, newQueryIndices, { root: true });

  // Set the labels of samples in the current batch viewed.
  newQueryIndices.forEach((index: number) => {
    newStatuses[index] = Status.VIEWED;
  });
  commit(rootTypes.SET_STATUSES, newStatuses, { root: true });
};

export const updateModel = async (
  { commit, state, rootState }: ActionContext<IState, IRootState>,
): Promise<void> => {
  const {
    labelTasks,
    interimModelTrainingEnabled,
  } = state;
  const {
    dataObjects,
    labels,
    statuses,
    model,
  } = rootState;

  if (!interimModelTrainingEnabled) {
    return;
  }

  const enableImageClassification = labelTasks.findIndex(
    (d) => d === LabelTaskType.Classification,
  ) >= 0;
  const enableObjectDetection = labelTasks.findIndex(
    (d) => d === LabelTaskType.ObjectDetection,
  ) >= 0;
  const enableImageSegmentation = labelTasks.findIndex(
    (d) => d === LabelTaskType.Segmentation,
  ) >= 0;

  // Update the model.
  if (enableImageClassification) {
    const modelUpdated = (await API.updateModel(
      dataObjects,
      labels,
      statuses,
      model,
    ));
    commit(rootTypes.SET_MODEL, modelUpdated, { root: true });
  } else {
    // TBA
  }
};

export const assignDefaultLabels = async (
  { commit, state, rootState }: ActionContext<IState, IRootState>,
): Promise<void> => {
  const { labelTasks } = state;
  const {
    classes,
    dataObjects,
    queryIndices,
    model,
    unlabeledMark,
  } = rootState;

  const enableImageClassification = labelTasks.findIndex(
    (d) => d === LabelTaskType.Classification,
  ) >= 0;
  const enableObjectDetection = labelTasks.findIndex(
    (d) => d === LabelTaskType.ObjectDetection,
  ) >= 0;
  const enableImageSegmentation = labelTasks.findIndex(
    (d) => d === LabelTaskType.Segmentation,
  ) >= 0;

  // Assign default labels to the sampled data objects.
  if (enableImageClassification) {
    const sampledDataObjects = queryIndices.map((d) => dataObjects[d]);
    const uuids = sampledDataObjects.map((d) => d.uuid);
    const defaultLabels = (await API.assignDefaultLabels(
      sampledDataObjects,
      model,
      classes,
      unlabeledMark,
    ));
    commit(rootTypes.SET_DATA_OBJECT_LABELS, {
      uuids,
      labels: defaultLabels,
      inQueryIndices: true,
    }, { root: true });
  } else {
    // TBA
  }
};

export const resetState = (
  { commit }: ActionContext<IState, IRootState>,
): void => {
  const {
    samplingStrategy,
    nBatch,
    defaultLabelingMethod,
    showDatasetOverview,
    itemsPerRow,
    itemsPerCol,
  } = createInitialState();
  commit(types.SET_SAMPLING_STRATEGY, samplingStrategy);
  commit(types.SET_N_BATCH, nBatch);
  commit(types.SET_DEFAULT_LABELING_METHOD, defaultLabelingMethod);
  commit(types.SET_SHOW_DATASET_OVERVIEW, showDatasetOverview);
  commit(types.SET_ITEMS_PER_ROW, itemsPerRow);
  commit(types.SET_ITEMS_PER_COL, itemsPerCol);
};

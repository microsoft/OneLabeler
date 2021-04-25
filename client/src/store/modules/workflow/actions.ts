import { ActionContext } from 'vuex';
import * as API from '@/services/data-labeling-api';
import {
  MethodParams,
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
  IImage,
  Status,
  MessageType,
  LabelTaskType,
  ModelService,
  Process,
  DataType,
  WorkflowNodeType,
} from '@/commons/types';
import * as types from './mutation-types';
import * as rootTypes from '../mutation-types';
import { IState } from './state';
import { IState as IRootState } from '../state';

export const setNodes = (
  { commit }: ActionContext<IState, IRootState>,
  nodes: WorkflowNode[],
): void => {
  commit(types.SET_NODES, nodes);
};

export const pushNodes = (
  { commit, state }: ActionContext<IState, IRootState>,
  node: WorkflowNode,
): void => {
  const { nodes } = state;
  commit(types.SET_NODES, [...nodes, node]);
};

export const editNode = (
  { commit, state }: ActionContext<IState, IRootState>,
  nodeUpdated: WorkflowNode,
): void => {
  const { nodes } = state;
  const idx = nodes.findIndex((d) => d.id === nodeUpdated.id);
  const nodesUpdated = [...nodes];
  nodesUpdated[idx] = nodeUpdated;
  commit(types.SET_NODES, nodesUpdated);
};

export const removeNode = (
  { commit, state }: ActionContext<IState, IRootState>,
  node: WorkflowNode,
): void => {
  const { nodes } = state;
  const idx = nodes.findIndex((d) => d.id === node.id);
  const nodesUpdated = [
    ...nodes.slice(0, idx),
    ...nodes.slice(idx + 1),
  ];
  commit(types.SET_NODES, nodesUpdated);
};

export const setEdges = (
  { commit }: ActionContext<IState, IRootState>,
  edges: WorkflowEdge[],
): void => {
  commit(types.SET_EDGES, edges);
};

export const pushEdges = (
  { commit, state }: ActionContext<IState, IRootState>,
  edge: WorkflowEdge,
): void => {
  const { edges } = state;
  commit(types.SET_NODES, [...edges, edge]);
};

export const removeEdge = (
  { commit, state }: ActionContext<IState, IRootState>,
  edge: WorkflowEdge,
): void => {
  const { edges } = state;
  const idx = edges.findIndex((d) => d.id === edge.id);
  const edgesUpdated = [
    ...edges.slice(0, idx),
    ...edges.slice(idx + 1),
  ];
  commit(types.SET_EDGES, edgesUpdated);
};

export const setGraph = (
  { commit }: ActionContext<IState, IRootState>,
  graph: WorkflowGraph,
): void => {
  commit(types.SET_NODES, graph.nodes);
  commit(types.SET_EDGES, graph.edges);
};

export const resetGraph = (
  { commit }: ActionContext<IState, IRootState>,
): void => {
  commit(types.SET_NODES, []);
  commit(types.SET_EDGES, []);
};

export const setDataType = (
  { commit }: ActionContext<IState, IRootState>,
  dataType: DataType,
): void => {
  commit(types.SET_DATA_TYPE, dataType);
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

export const pushModelServices = (
  { commit, state }: ActionContext<IState, IRootState>,
  service: ModelService,
): void => {
  const { modelServices } = state;
  commit(types.SET_MODEL_SERVICES, [
    ...modelServices,
    service,
  ]);
};

export const editModelService = (
  { commit, state }: ActionContext<IState, IRootState>,
  newValue: ModelService,
): void => {
  const { modelServices } = state;
  const idx = modelServices.findIndex(
    (d: ModelService) => d.objectId === newValue.objectId,
  );
  const newModelServices = [...modelServices];
  newModelServices[idx] = newValue;
  commit(types.SET_MODEL_SERVICES, newModelServices);
};

export const setProcesses = (
  { commit }: ActionContext<IState, IRootState>,
  processes: Process[],
): void => {
  commit(types.SET_PROCESSES, processes);
};

export const pushProcesses = (
  { commit, state }: ActionContext<IState, IRootState>,
  process: Process,
): void => {
  const { processes } = state;
  commit(types.SET_PROCESSES, [...processes, process]);
};

export const editProcess = (
  { commit, state }: ActionContext<IState, IRootState>,
  processUpdated: Process,
): void => {
  const { processes } = state;
  const idx = processes.findIndex((d) => d.id === processUpdated.id);
  const processesUpdated = [...processes];
  processesUpdated[idx] = processUpdated;
  commit(types.SET_PROCESSES, processesUpdated);
};

export const executeDataObjectExtraction = async (
  { commit, state, rootState }: ActionContext<IState, IRootState>,
  files: FileList,
): Promise<void> => {
  const { labelTasks } = state;
  const { unlabeledMark } = rootState;

  // Extract data objects.
  const dataObjects = (await API.dataObjectExtraction(files));
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

export const executeInterimModelTraining = async (
  { state, rootState }: ActionContext<IState, IRootState>,
  method: Process,
): Promise<void> => {
  const {
    dataObjects,
    labels,
    statuses,
  } = rootState;
  const { nodes } = state;
  nodes.forEach(async (d) => {
    if (Array.isArray(d.value)) {
      const nodeMethods = d.value as Process[];
      nodeMethods.forEach(async (m) => {
        if (!m.isModelBased) return;
        const model = m.model as ModelService;
        (await API.interimModelTraining(
          method,
          model,
          dataObjects,
          labels,
          statuses,
        ));
      });
    } else {
      const nodeMethod = d.value as Process;
      if (!nodeMethod.isModelBased) return;
      const model = nodeMethod.model as ModelService;
      (await API.interimModelTraining(
        method,
        model,
        dataObjects,
        labels,
        statuses,
      ));
    }
  });
};

export const executeDataObjectSelectionAlgorithmic = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  method: Process,
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
  const model = method.model as ModelService;
  const nBatch = (method.params as MethodParams).nBatch.value as number;
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
  method: Process,
): Promise<void> => {
  const {
    dataObjects,
    queryIndices,
    classes,
    unlabeledMark,
  } = rootState;
  const sampledDataObjects = queryIndices.map((d) => dataObjects[d]);
  const uuids = sampledDataObjects.map((d) => d.uuid);
  const model = method.model as ModelService;
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
  method: Process,
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

export const executeStoppageAnalysis = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  method: Process,
): Promise<void> => {
  const { statuses, unlabeledMark } = rootState;
  const stop = !(statuses.findIndex((d) => (
    d === Status.New
    || d === Status.Viewed
    || d === Status.Skipped
  )) >= 0);
  if (stop) {
    commit(rootTypes.SET_MESSAGE, {
      content: 'All Data Objects Labeled.',
      type: MessageType.Success,
    }, { root: true });
  }
  commit(rootTypes.SET_STOP, stop, { root: true });
};

const getOutputNodes = (
  node: WorkflowNode,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): WorkflowNode[] => {
  const outputNodeIds = edges.filter(
    (edge) => edge.source === node.id,
  ).map((edge) => edge.target);
  const outputNodes = outputNodeIds.map((id: string) => (
    nodes.find((d) => d.id === id) as WorkflowNode
  ));
  return outputNodes;
};

export const executeWorkflow = async (
  store: ActionContext<IState, IRootState>,
  node: WorkflowNode,
): Promise<void> => {
  const { commit, state, rootState } = store;
  const { nodes, edges } = state;
  let outputNode = null;

  if (node.type === WorkflowNodeType.Initialization) {
    [outputNode] = getOutputNodes(node, nodes, edges);
  }

  if (node.type === WorkflowNodeType.Terminal) {
    return;
  }

  if (node.type === WorkflowNodeType.Decision) {
    const { stop } = rootState;
    if (stop) {
      [outputNode] = getOutputNodes(
        node, nodes, edges.filter((d) => d.condition === true),
      );
    } else {
      [outputNode] = getOutputNodes(
        node, nodes, edges.filter((d) => d.condition === false),
      );
    }
  }

  if (node.type === WorkflowNodeType.LabelIdeation) {
    [outputNode] = getOutputNodes(node, nodes, edges);
  }

  if (node.type === WorkflowNodeType.FeatureExtraction) {
    const method = node.value as Process;
    await executeFeatureExtraction(store, method);
    [outputNode] = getOutputNodes(node, nodes, edges);
  }

  if (node.type === WorkflowNodeType.DataObjectSelection) {
    const interactiveMethod = (node.value as Process[])
      .find((d) => !d.isAlgorithmic);
    if (interactiveMethod !== undefined) {
      return;
    }
    const [method] = node.value as Process[];
    await executeDataObjectSelectionAlgorithmic(store, method);
    [outputNode] = getOutputNodes(node, nodes, edges);
  }

  if (node.type === WorkflowNodeType.DefaultLabeling) {
    const method = node.value as Process;
    await executeDefaultLabeling(store, method);
    [outputNode] = getOutputNodes(node, nodes, edges);
  }

  if (node.type === WorkflowNodeType.TaskTransformation) {
    [outputNode] = getOutputNodes(node, nodes, edges);
  }

  if (node.type === WorkflowNodeType.InteractiveLabeling) {
    return;
  }

  if (node.type === WorkflowNodeType.StoppageAnalysis) {
    const method = node.value as Process;
    await executeStoppageAnalysis(store, method);
    [outputNode] = getOutputNodes(node, nodes, edges);
  }

  if (node.type === WorkflowNodeType.InterimModelTraining) {
    const method = node.value as Process;
    await executeInterimModelTraining(store, method);
    [outputNode] = getOutputNodes(node, nodes, edges);
  }

  if (node.type === WorkflowNodeType.QualityAssurance) {
    // TODO
  }

  commit(types.SET_CURRENT_NODE, outputNode);
  await executeWorkflow(store, outputNode as WorkflowNode);
};

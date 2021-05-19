import { ActionContext } from 'vuex';
import * as API from '@/services/data-labeling-api';
import {
  MethodParams,
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
  IImage,
  ILabel,
  IStatus,
  StatusType,
  MessageType,
  ModelService,
  Process,
  WorkflowNodeType,
  Category,
  ILabelCategory,
  IDataObject,
  IDataObjectStorage,
} from '@/commons/types';
import * as types from './mutation-types';
import * as rootTypes from '../mutation-types';
import { IState } from './state';
import { IState as IRootState } from '../state';
import { dataType } from './getters';

export const setCurrentNode = (
  { commit }: ActionContext<IState, IRootState>,
  node: WorkflowNode | null,
): void => {
  commit(types.SET_CURRENT_NODE, node);
};

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
  commit(types.SET_EDGES, [...edges, edge]);
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
  commit(types.SET_CURRENT_NODE, null);
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
  { commit, state }: ActionContext<IState, IRootState>,
  input: File | FileList,
): Promise<void> => {
  const type = dataType(state);
  if (type === null) return;

  // Extract data objects.
  const dataObjects: IDataObjectStorage = (await API.dataObjectExtraction(input, type));
  commit(rootTypes.SET_DATA_OBJECTS, dataObjects, { root: true });

  // Initialize label statuses.
  const statuses: IStatus[] = (await dataObjects.getAll())
    .map((d) => ({ uuid: d.uuid, value: StatusType.New }));
  commit(rootTypes.SET_STATUSES, statuses, { root: true });
};

export const executeDataObjectSelectionAlgorithmic = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  method: Process,
): Promise<void> => {
  const {
    labels,
    statuses,
    queryUuids,
    unlabeledMark,
  } = rootState;

  // Set the labels of samples in the last batch confirmed
  const newStatuses = [...statuses];
  queryUuids.forEach((uuid: string) => {
    const index = labels?.findIndex((d) => d.uuid === uuid) as number;
    const newStatus: IStatus = {
      uuid,
      value: (labels !== null && labels[index].category === unlabeledMark)
        ? StatusType.Skipped
        : StatusType.Labeled,
    };
    newStatuses[index] = newStatus;
  });

  // Sample data objects.
  const { dataObjects } = rootState as { dataObjects: IDataObjectStorage };
  const model = method.model as ModelService;
  const nBatch = (method.params as MethodParams).nBatch.value as number;
  const newQueryIndices = (await API.dataObjectSelection(
    method,
    statuses.map((d) => d.value),
    nBatch,
    model,
    await dataObjects.getAll(),
  ));
  const dataObjectsAll = await dataObjects.getAll();
  const newQueryUuids = newQueryIndices.map((d) => dataObjectsAll[d].uuid);
  commit(rootTypes.SET_QUERY_UUIDS, newQueryUuids, { root: true });

  // Set the labels status of samples in the current batch.
  // If the samples had been labeled, keep it unchanged.
  // Else, set it to be viewed.
  newQueryIndices.forEach((index: number) => {
    if (newStatuses[index].value === StatusType.Labeled) return;
    newStatuses[index] = { ...newStatuses[index], value: StatusType.Viewed };
  });
  commit(rootTypes.SET_STATUSES, newStatuses, { root: true });
};

export const executeDataObjectSelectionManual = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  newQueryUuids: string[],
): Promise<void> => {
  const {
    labels,
    statuses,
    queryUuids,
    unlabeledMark,
  } = rootState;

  // Set the label status of samples in the last batch labeled.
  const newStatuses = [...statuses];
  queryUuids.forEach((uuid: string) => {
    const index = labels?.findIndex((d) => d.uuid === uuid) as number;
    const newStatus: IStatus = {
      uuid,
      value: (labels !== null && labels[index].category === unlabeledMark)
        ? StatusType.Skipped
        : StatusType.Labeled,
    };
    newStatuses[index] = newStatus;
  });

  // Sample data objects.
  commit(rootTypes.SET_QUERY_UUIDS, newQueryUuids, { root: true });

  // Set the labels status of samples in the current batch.
  // If the samples had been labeled, keep it unchanged.
  // Else, set it to be viewed.
  newQueryUuids.forEach((uuid: string) => {
    const index = labels?.findIndex((d) => d.uuid === uuid) as number;
    if (newStatuses[index].value === StatusType.Labeled) return;
    newStatuses[index] = { ...newStatuses[index], value: StatusType.Viewed };
  });
  commit(rootTypes.SET_STATUSES, newStatuses, { root: true });
};

export const executeDefaultLabeling = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  method: Process,
): Promise<void> => {
  const {
    labels,
    dataObjects,
    queryUuids,
    classes,
    unlabeledMark,
  } = rootState;
  const queriedDataObjects = (await (dataObjects as IDataObjectStorage)
    .getBulk(queryUuids)) as IDataObject[];
  const model = method.model as ModelService;
  const labelCategories: ILabelCategory[] = (await API.defaultLabeling(
    method,
    queriedDataObjects,
    model,
    classes,
    unlabeledMark,
  ));
  const updatedLabels = queryUuids.map((uuid, i) => {
    const label = labels.find((d) => d.uuid === uuid);
    return { ...label, category: labelCategories[i] };
  }) as ILabel[];
  commit(rootTypes.SET_LABELS_OF, {
    queryUuids,
    labels: updatedLabels,
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

  const labelCategories = labels.map((d) => d.category as Category);
  const response = requireLabels
    ? (await API.featureExtraction(
      method,
      await dataObjects.getAll() as IImage[],
      labelCategories,
      statuses.map((d) => d.value),
    )) : (await API.featureExtraction(method, await dataObjects.getAll() as IImage[]));

  commit(rootTypes.SET_DATA_OBJECTS, response.dataObjects, { root: true });
  commit(rootTypes.SET_FEATURE_NAMES, response.featureNames, { root: true });
};

export const executeInterimModelTraining = (
  { state, rootState }: ActionContext<IState, IRootState>,
  method: Process,
): void => {
  const isProcessNode = (node: WorkflowNode): boolean => (
    node.type !== WorkflowNodeType.Initialization
    && node.type !== WorkflowNodeType.Decision
    && node.type !== WorkflowNodeType.Terminal
  );
  const {
    dataObjects,
    labels,
    statuses,
  } = rootState;
  const labelCategories = labels.map((d) => d.category as Category);
  const { nodes } = state;
  nodes.filter((d) => isProcessNode(d))
    .forEach((d) => {
      const nodeMethods = Array.isArray(d.value)
        ? d.value as Process[]
        : [d.value as Process];
      nodeMethods.forEach(async (nodeMethod) => {
        if (!nodeMethod.isModelBased) return;
        const model = nodeMethod.model as ModelService;
        (await API.interimModelTraining(
          method,
          model,
          await dataObjects?.getAll(),
          labelCategories,
          statuses.map((status) => status.value),
        ));
      });
    });
};

export const executeStoppageAnalysis = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  method: Process,
): Promise<void> => {
  const { statuses } = rootState;
  const stop = !(statuses.findIndex((d) => (
    d.value === StatusType.New
    || d.value === StatusType.Viewed
    || d.value === StatusType.Skipped
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
    const algorithmicMethod = (node.value as Process[])
      .find((d) => d.isAlgorithmic);
    if (algorithmicMethod !== undefined) {
      await executeDataObjectSelectionAlgorithmic(store, algorithmicMethod);
    }
    /*
    const interactiveMethod = (node.value as Process[])
      .find((d) => !d.isAlgorithmic);
    if (interactiveMethod !== undefined) {
      return;
    }
    */
    [outputNode] = getOutputNodes(node, nodes, edges);
    commit(types.SET_CURRENT_NODE, outputNode);
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

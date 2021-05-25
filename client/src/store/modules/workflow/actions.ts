import { ActionContext } from 'vuex';
import * as API from '@/services/data-labeling-api';
import createStorage from '@/services/storage';
import {
  MethodParams,
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
  ILabel,
  IStatus,
  StatusType,
  MessageType,
  ModelService,
  Process,
  WorkflowNodeType,
  ILabelCategory,
  IDataObject,
  IDataObjectStorage,
  SourceType,
  StorageService,
  IStorageStore,
  SourceService,
  StorageType,
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

const pointsToSameDB = (
  s1: SourceService | StorageService,
  s2: SourceService | StorageService,
): boolean => {
  if (s1.type !== SourceType.ServerDB && s1.type !== StorageType.ServerDB) return false;
  if (s2.type !== SourceType.ServerDB && s2.type !== StorageType.ServerDB) return false;
  return s1.api === s2.api;
};

export const executeRegisterStorage = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
): Promise<void> => {
  // Initialize the storage.
  const { sourceService, storageService } = rootState;
  const storage: IStorageStore | null = createStorage(storageService);
  if (storage === null) return;
  if (!pointsToSameDB(sourceService, storageService)) {
    await storage.dataObjects.deleteAll();
    await storage.labels.deleteAll();
    await storage.statuses.deleteAll();
    if (sourceService.type === SourceType.ServerDB) {
      const source = createStorage(sourceService as unknown as StorageService);
      if (source !== null) {
        await storage.dataObjects.upsertBulk(await source.dataObjects.getAll());
        await storage.labels.upsertBulk(await source.labels.getAll());
        await storage.statuses.upsertBulk(await source.statuses.getAll());
      }
    }
  }
  commit(rootTypes.SET_DATA_OBJECTS, storage.dataObjects, { root: true });
  commit(rootTypes.SET_LABELS, storage.labels, { root: true });
  commit(rootTypes.SET_STATUSES, storage.statuses, { root: true });
};

export const executeDataObjectExtraction = async (
  { commit, state, rootState }: ActionContext<IState, IRootState>,
  input: File | FileList,
): Promise<void> => {
  const type = dataType(state);
  const { dataObjects } = rootState;
  if (type === null || dataObjects === null) return;

  // Extract data objects.
  const updatedDataObjects: IDataObjectStorage = await API.dataObjectExtraction(
    input,
    type,
    dataObjects,
  );
  commit(rootTypes.SET_DATA_OBJECTS, updatedDataObjects, { root: true });
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

  if (labels === null || statuses === null) return;

  // Set the label status of samples in the last batch labeled.
  await Promise.all(queryUuids.map(async (uuid: string) => {
    const label: ILabel | undefined = await labels.get(uuid);
    const status: IStatus = {
      uuid,
      value: (label === undefined || label.category === unlabeledMark)
        ? StatusType.Skipped
        : StatusType.Labeled,
    };
    await statuses.upsert(status);
  }));
  commit(rootTypes.SET_STATUSES, statuses.shallowCopy(), { root: true });

  // Sample data objects.
  const { dataObjects } = rootState as { dataObjects: IDataObjectStorage };
  const model = method.model as ModelService;
  const nBatch = (method.params as MethodParams).nBatch.value as number;
  const newQueryUuids = (await API.dataObjectSelection(
    method,
    dataObjects,
    statuses,
    nBatch,
    model,
  ));
  commit(rootTypes.SET_QUERY_UUIDS, newQueryUuids, { root: true });

  // Set the labels status of samples in the current batch.
  // If the samples had been labeled, keep it unchanged.
  // Else, set it to be viewed.
  await Promise.all(newQueryUuids.map(async (uuid: string) => {
    const status: IStatus | undefined = await statuses.get(uuid);
    if (status !== undefined && status.value === StatusType.Labeled) return;
    await statuses.upsert({ uuid, value: StatusType.Viewed });
  }));
  commit(rootTypes.SET_STATUSES, statuses.shallowCopy(), { root: true });
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

  if (labels === null || statuses === null) return;

  // Set the label status of samples in the last batch labeled.
  await Promise.all(queryUuids.map(async (uuid: string) => {
    const label: ILabel | undefined = await labels.get(uuid);
    const status: IStatus = {
      uuid,
      value: (label === undefined || label.category === unlabeledMark)
        ? StatusType.Skipped
        : StatusType.Labeled,
    };
    await statuses.upsert(status);
  }));
  commit(rootTypes.SET_STATUSES, statuses.shallowCopy(), { root: true });

  // Sample data objects.
  commit(rootTypes.SET_QUERY_UUIDS, newQueryUuids, { root: true });

  // Set the labels status of samples in the current batch.
  // If the samples had been labeled, keep it unchanged.
  // Else, set it to be viewed.
  await Promise.all(newQueryUuids.map(async (uuid: string) => {
    const status: IStatus | undefined = await statuses.get(uuid);
    if (status !== undefined && status.value === StatusType.Labeled) return;
    await statuses.upsert({ uuid, value: StatusType.Viewed });
  }));

  commit(rootTypes.SET_STATUSES, statuses.shallowCopy(), { root: true });
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
  if (labels === null) return;

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
  await Promise.all(queryUuids.map(async (uuid, i) => {
    const label: ILabel | undefined = await labels.get(uuid);
    const labelUpdated: ILabel = label === undefined
      ? {
        uuid,
        category: labelCategories[i],
        shapes: undefined,
        mask: undefined,
      } : { ...label, category: labelCategories[i] };
    await labels.upsert(labelUpdated);
  }));
  commit(rootTypes.SET_LABELS, labels.shallowCopy(), { root: true });
};

export const executeFeatureExtraction = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  method: Process,
): Promise<void> => {
  const { dataObjects, labels, statuses } = rootState;

  if (dataObjects === null || labels === null || statuses === null) return;

  const requireLabels = method.inputs
    .findIndex((d) => d === 'labels') >= 0;
  const response = requireLabels
    ? (await API.featureExtraction(method, dataObjects, labels, statuses))
    : (await API.featureExtraction(method, dataObjects));

  commit(rootTypes.SET_DATA_OBJECTS, response.dataObjects.shallowCopy(), { root: true });
  commit(rootTypes.SET_FEATURE_NAMES, response.featureNames, { root: true });
};

export const executeInterimModelTraining = async (
  { state, rootState }: ActionContext<IState, IRootState>,
  method: Process,
): Promise<void> => {
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
  if (labels === null || statuses === null) return;

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
          dataObjects,
          labels,
          statuses,
        ));
      });
    });
};

export const executeStoppageAnalysis = async (
  { commit, rootState }: ActionContext<IState, IRootState>,
  method: Process,
): Promise<void> => {
  const { dataObjects, statuses } = rootState;
  if (dataObjects === null || statuses === null) return;
  const nDataObjects = await dataObjects.count();
  const nLabeled = await statuses.count({ value: StatusType.Labeled });
  const stop = nDataObjects === nLabeled;
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
    // commit(types.SET_CURRENT_NODE, outputNode);
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

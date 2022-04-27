// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { ActionContext } from 'vuex';
import showProgressBar from '@/plugins/nprogress-interceptor';
import * as API from '@/services/data-labeling-api';
import createStorage from '@/services/storage';
import dataTypeSetups from '@/builtins/data-types/index';
import {
  MessageType,
  SourceType,
  StorageType,
  StatusType,
  WorkflowNodeType,
  Category,
} from '@/commons/types';
import type {
  ModuleParams,
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
  ILabel,
  IStatus,
  ModelService,
  IModule,
  IDataObject,
  StorageService,
  IStorageStore,
  SourceService,
} from '@/commons/types';
import * as types from './mutation-types';
import * as rootTypes from '../mutation-types';
import type { IState } from './state';
import type { IState as IRootState } from '../state';
import { dataType } from './getters';

export const setCurrentNode = (
  { commit }: Pick<ActionContext<IState, IRootState>, 'commit'>,
  node: WorkflowNode | null,
): void => {
  commit(types.SET_CURRENT_NODE, node);
};

export const setNodes = (
  { commit }: Pick<ActionContext<IState, IRootState>, 'commit'>,
  nodes: WorkflowNode[],
): void => {
  commit(types.SET_NODES, nodes);
};

export const pushNodes = (
  { commit, state }: Pick<ActionContext<IState, IRootState>, 'commit' | 'state'>,
  node: WorkflowNode,
): void => {
  const { nodes } = state;
  commit(types.SET_NODES, [...nodes, node]);
};

export const editNode = (
  { commit, state }: Pick<ActionContext<IState, IRootState>, 'commit' | 'state'>,
  nodeUpdated: WorkflowNode,
): void => {
  const { nodes } = state;
  const idx = nodes.findIndex((d) => d.id === nodeUpdated.id);
  const nodesUpdated = [...nodes];
  nodesUpdated[idx] = nodeUpdated;
  commit(types.SET_NODES, nodesUpdated);
};

export const removeNode = (
  { commit, state }: Pick<ActionContext<IState, IRootState>, 'commit' | 'state'>,
  node: WorkflowNode,
): void => {
  const { nodes } = state;
  const nodesUpdated = nodes.filter((d) => d.id !== node.id);
  commit(types.SET_NODES, nodesUpdated);
};

export const setEdges = (
  { commit }: Pick<ActionContext<IState, IRootState>, 'commit'>,
  edges: WorkflowEdge[],
): void => {
  commit(types.SET_EDGES, edges);
};

export const pushEdges = (
  { commit, state }: Pick<ActionContext<IState, IRootState>, 'commit' | 'state'>,
  edge: WorkflowEdge,
): void => {
  const { edges } = state;
  commit(types.SET_EDGES, [...edges, edge]);
};

export const editEdge = (
  { commit, state }: Pick<ActionContext<IState, IRootState>, 'commit' | 'state'>,
  edgeUpdated: WorkflowEdge,
): void => {
  const { edges } = state;
  const idx = edges.findIndex((d) => d.id === edgeUpdated.id);
  const edgesUpdated = [...edges];
  edgesUpdated[idx] = edgeUpdated;
  commit(types.SET_EDGES, edgesUpdated);
};

export const removeEdge = (
  { commit, state }: Pick<ActionContext<IState, IRootState>, 'commit' | 'state'>,
  edge: WorkflowEdge,
): void => {
  const { edges } = state;
  const edgesUpdated = edges.filter((d) => d.id !== edge.id);
  commit(types.SET_EDGES, edgesUpdated);
};

export const setGraph = (
  { commit }: Pick<ActionContext<IState, IRootState>, 'commit'>,
  graph: WorkflowGraph,
): void => {
  commit(types.SET_NODES, graph.nodes);
  commit(types.SET_EDGES, graph.edges);
};

export const resetGraph = (
  { commit }: Pick<ActionContext<IState, IRootState>, 'commit'>,
): void => {
  commit(types.SET_NODES, []);
  commit(types.SET_EDGES, []);
  commit(types.SET_CURRENT_NODE, null);
};

export const setModelServices = (
  { commit }: Pick<ActionContext<IState, IRootState>, 'commit'>,
  services: ModelService[],
): void => {
  commit(types.SET_MODEL_SERVICES, services);
};

export const pushModelServices = (
  { commit, state }: Pick<ActionContext<IState, IRootState>, 'commit' | 'state'>,
  service: ModelService,
): void => {
  const { modelServices } = state;
  commit(types.SET_MODEL_SERVICES, [
    ...modelServices,
    service,
  ]);
};

export const editModelService = (
  { commit, state }: Pick<ActionContext<IState, IRootState>, 'commit' | 'state'>,
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

export const pushModules = (
  { commit, state }: Pick<ActionContext<IState, IRootState>, 'commit' | 'state'>,
  process: IModule,
): void => {
  const { processes } = state;
  commit(types.SET_MODULES, [...processes, process]);
};

export const editModule = (
  { commit, state }: Pick<ActionContext<IState, IRootState>, 'commit' | 'state'>,
  processUpdated: IModule,
): void => {
  const { processes } = state;
  const idx = processes.findIndex((d) => d.id === processUpdated.id);
  const processesUpdated = [...processes];
  processesUpdated[idx] = processUpdated;
  commit(types.SET_MODULES, processesUpdated);
};

const pointsToSameDB = (
  s1: SourceService | StorageService,
  s2: SourceService | StorageService,
): boolean => {
  if (s1.type !== SourceType.ServerDB && s1.type !== StorageType.ServerDB) return false;
  if (s2.type !== SourceType.ServerDB && s2.type !== StorageType.ServerDB) return false;
  return s1.api === s2.api;
};

const handleAlgorithmServiceError = (
  e: unknown,
  commit: ActionContext<IState, IRootState>['commit'],
): void => {
  if (e instanceof TypeError) {
    commit(rootTypes.SET_MESSAGE, {
      content: e.message,
      type: MessageType.Error,
    }, { root: true });
    return;
  }
  throw e;
};

export const executeModule = showProgressBar(async (
  { commit, rootState }: Pick<ActionContext<IState, IRootState>, 'commit' | 'rootState'>,
  moduleInstance: IModule,
): Promise<void> => {
  if (moduleInstance.run === undefined || moduleInstance.run === null) {
    throw Error('Method not implemented');
  }

  const {
    dataObjects,
    labels,
    statuses,
    queryUuids,
    categoryTasks,
    unlabeledMark,
    stop,
  } = rootState;

  // TODO: should only access categories visible to the current label task.
  const categories: Category[] = Object.keys(categoryTasks);
  const { inputs, outputs } = moduleInstance;
  const nDataObjects = await dataObjects?.count() ?? null;

  const payload = {
    ...(inputs.includes('dataObjects') && { dataObjects }),
    ...(inputs.includes('labels') && {
      labels,
      statuses,
      nDataObjects,
      unlabeledMark,
    }),
    ...(inputs.includes('queryUuids') && { queryUuids }),
    ...(inputs.includes('features') && { dataObjects }),
    ...(inputs.includes('model') && { model: moduleInstance.model, categories, unlabeledMark }),
    ...(inputs.includes('categories') && { categories, unlabeledMark }),
    ...(inputs.includes('stop') && { stop }),
  };

  try {
    const response = await moduleInstance.run(payload);
    if (outputs.includes('dataObjects')) {
      if (dataObjects === null) throw Error('Data object storage not initialized');
      const { dataObjects: newValue } = response as { dataObjects: IDataObject[] };
      dataObjects.upsertBulk(newValue);
      commit(rootTypes.SET_DATA_OBJECTS, dataObjects.shallowCopy(), { root: true });
    }
    if (outputs.includes('labels')) {
      if (labels === null) throw Error('Label storage not initialized');
      const { labels: newValue } = response as { labels: ILabel[] };
      await Promise.all(newValue.map(async (newLabel) => {
        await labels.upsert({ ...await labels.get(newLabel.uuid), ...newLabel });
      }));
      // labels.upsertBulk(newValue);
      commit(rootTypes.SET_LABELS, labels.shallowCopy(), { root: true });
    }
    if (outputs.includes('queryUuids')) {
      const { queryUuids: newValue } = response as { queryUuids: string[] };
      commit(rootTypes.SET_QUERY_UUIDS, newValue, { root: true });
    }
    if (outputs.includes('model')) {
      // TODO
    }
    if (outputs.includes('features')) {
      if (dataObjects === null) throw Error('Data object storage not initialized');
      const { features } = response as { features: number[][] };
      let { featureNames } = response as { featureNames?: string[] };
      featureNames = featureNames ?? [...features[0].keys()].map((d) => String(d)) as string[];

      const uuids = await dataObjects.uuids();
      await Promise.all(uuids.map(async (uuid, i) => {
        const dataObject = await dataObjects.get(uuid);
        if (dataObject === undefined) return;
        await dataObjects.upsert({ ...dataObject, features: features[i] });
      }));
      commit(rootTypes.SET_DATA_OBJECTS, dataObjects.shallowCopy(), { root: true });
      commit(rootTypes.SET_FEATURE_NAMES, featureNames, { root: true });
    }
    if (outputs.includes('categories')) {
      const { categories: newValue } = response as { categories: string[] };
      const newCategoryTasks = { ...categoryTasks };
      newValue.forEach((category) => { newCategoryTasks[category] = null; });
      commit(rootTypes.SET_CATEGORY_TASKS, newCategoryTasks, { root: true });
    }
    if (outputs.includes('stop')) {
      const { stop: newValue } = response as { stop: boolean };
      if (newValue) {
        commit(rootTypes.SET_MESSAGE, {
          content: 'All Data Objects Labeled.',
          type: MessageType.Success,
        }, { root: true });
      }
      commit(rootTypes.SET_STOP, newValue, { root: true });
    }
  } catch (e) {
    handleAlgorithmServiceError(e, commit);
  }
});

export const executeRegisterStorage = showProgressBar(async (
  { commit, rootState }: Pick<ActionContext<IState, IRootState>, 'commit' | 'rootState'>,
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
});

export const executeDataObjectExtraction = showProgressBar(async (
  { commit, state, rootState }: Pick<ActionContext<IState, IRootState>, 'commit' | 'state' | 'rootState'>,
  input: File | FileList,
): Promise<void> => {
  const type = dataType(state);
  const { dataObjects } = rootState;
  if (type === null || dataObjects === null) return;

  // Extract data objects from the data source.
  const dataTypeSetup = dataTypeSetups.find((d) => d.type === type);
  if (dataTypeSetup === undefined) throw new Error(`Invalid Data Type: ${type}`);
  await dataTypeSetup.handleImport(input, dataObjects);

  commit(rootTypes.SET_DATA_OBJECTS, dataObjects.shallowCopy(), { root: true });
});

export const executeDataObjectSelectionAlgorithmic = showProgressBar(async (
  { commit, rootState }: Pick<ActionContext<IState, IRootState>, 'commit' | 'rootState'>,
  moduleInstance: IModule,
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
  const { dataObjects } = rootState;
  if (dataObjects === null) throw Error('Data object storage not initialized.');
  const model = moduleInstance.model as ModelService;
  const nBatch = (moduleInstance.params as ModuleParams).nBatch.value as number;

  let newQueryUuids: string[] = [];
  try {
    newQueryUuids = (await API.dataObjectSelection(
      moduleInstance,
      dataObjects,
      statuses,
      nBatch,
      model,
    ));
    commit(rootTypes.SET_QUERY_UUIDS, newQueryUuids, { root: true });
  } catch (e) {
    handleAlgorithmServiceError(e, commit);
    return;
  }

  // Set the labels status of samples in the current batch.
  // If the samples had been labeled, keep it unchanged.
  // Else, set it to be viewed.
  await Promise.all(newQueryUuids.map(async (uuid: string) => {
    const status: IStatus | undefined = await statuses.get(uuid);
    if (status !== undefined && status.value === StatusType.Labeled) return;
    await statuses.upsert({ uuid, value: StatusType.Viewed });
  }));
  commit(rootTypes.SET_STATUSES, statuses.shallowCopy(), { root: true });
});

export const executeDataObjectSelectionManual = showProgressBar(async (
  { commit, rootState }: Pick<ActionContext<IState, IRootState>, 'commit' | 'rootState'>,
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
});

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
  { node, recursive = true }: { node: WorkflowNode, recursive: boolean },
): Promise<void> => {
  const { commit, state, rootState } = store;
  const { nodes, edges } = state;

  if (node.type === WorkflowNodeType.Exit) return;

  if (
    node.type === WorkflowNodeType.FeatureExtraction
    || node.type === WorkflowNodeType.DefaultLabeling
    || node.type === WorkflowNodeType.StoppageAnalysis
    || node.type === WorkflowNodeType.ModelTraining
    || node.type === WorkflowNodeType.Base
  ) {
    if (node.value?.blocking === true) {
      await executeModule(store, node.value as IModule);
    } else {
      executeModule(store, node.value as IModule);
    }
  }

  if (node.type === WorkflowNodeType.DataObjectSelection) {
    const moduleInstance = node.value as IModule;
    if (moduleInstance.render === undefined) {
      if (node.value?.blocking === true) {
        await executeDataObjectSelectionAlgorithmic(store, moduleInstance);
      } else {
        executeDataObjectSelectionAlgorithmic(store, moduleInstance);
      }
    }
  }

  if (node.type === WorkflowNodeType.InteractiveLabeling) {
    return;
  }

  const { stop } = rootState;
  const outputNodes = getOutputNodes(
    node,
    nodes,
    node.type === WorkflowNodeType.Decision
      ? edges.filter((d) => d.condition === stop)
      : edges,
  );
  const outputNode = outputNodes.length === 0 ? null : outputNodes[0];
  commit(types.SET_CURRENT_NODE, outputNode);

  if (recursive && outputNode !== null) {
    await executeWorkflow(store, { node: outputNode, recursive });
  }
};

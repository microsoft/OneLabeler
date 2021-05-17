import { Store } from 'vuex';
import {
  LabelTaskType,
  Process,
  TaskWindow,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import { isNodeInteractive } from '@/commons/utils';
import { IState } from './state';
import * as types from './mutation-types';
import * as workflowTypes from './workflow/mutation-types';

const getLabelTasks = (nodes: WorkflowNode[]): LabelTaskType[] => {
  const type = WorkflowNodeType.Initialization;
  const node = nodes.find((d) => d.type === type);
  if (node === undefined) return [];
  return (node.value as { labelTasks: LabelTaskType[] }).labelTasks;
};

const updateLabels = (
  { commit, state }: { commit: Store<IState>['commit'], state: IState },
  labelTasks: LabelTaskType[],
): void => {
  const containsClassification = labelTasks.includes(LabelTaskType.Classification);
  const containsObjectDetection = labelTasks.includes(LabelTaskType.ObjectDetection);
  const containsSegmentation = labelTasks.includes(LabelTaskType.Segmentation);

  // Clear labels
  if (!containsClassification) {
    commit(types.SET_LABELS, null);
  }

  // Initialize labels
  if (
    containsClassification
    && (state.labels === null
      || (state.labels.length !== state.dataObjects.length))
  ) {
    const labels = Array(state.dataObjects.length).fill(state.unlabeledMark);
    commit(types.SET_LABELS, labels);
  }

  // Clear labelShapeLists
  if (!containsObjectDetection) {
    commit(types.SET_LABEL_SHAPE_LISTS, null);
  }

  // Initialize labelShapeLists
  if (
    containsObjectDetection
    && (state.labelShapeLists === null
      || (state.labelShapeLists.length !== state.dataObjects.length))
  ) {
    const labelShapeLists = Array(state.dataObjects.length)
      .fill(null).map(() => Array(0));
    commit(types.SET_LABEL_SHAPE_LISTS, labelShapeLists);
  }

  // Clear labelMasks
  if (!containsSegmentation) {
    commit(types.SET_LABEL_MASKS, null);
  }

  // Initialize labelMasks
  if (
    containsSegmentation
    && (state.labelMasks === null
      || (state.labelMasks.length !== state.dataObjects.length))
  ) {
    const labelMasks = Array(state.dataObjects.length).fill(null).map(() => ({
      path: null,
    }));
    commit(types.SET_LABEL_MASKS, labelMasks);
  }
};

const getUpdatedTaskWindows = (
  taskWindows: TaskWindow[],
  nodes: WorkflowNode[],
): TaskWindow[] => {
  const nodesWithInterface = nodes.filter((d) => isNodeInteractive(d));
  const result: TaskWindow[] = [];
  nodesWithInterface.forEach((node) => {
    const processes = Array.isArray(node.value)
      ? node.value as Process[]
      : [node.value as Process];
    processes.forEach((process) => {
      if (process.isAlgorithmic) return;
      const match = taskWindows.find((d) => (
        d.node.id === node.id && d.process.id === process.id
      ));
      result.push(match !== undefined
        ? match
        : {
          node,
          process,
          isPinned: false,
          isMinimized: false,
        });
    });
  });
  return result;
};

const plugin = (store: Store<IState>) => {
  store.subscribe((mutation, state: IState) => {
    if (mutation.type === types.SET_DATA_OBJECTS) {
      const nodes = state.workflow.nodes as WorkflowNode[];
      const labelTasks = getLabelTasks(nodes);
      updateLabels({ commit: store.commit, state }, labelTasks);
    }
    if (mutation.type === `workflow/${workflowTypes.SET_NODES}`) {
      const labelTasks = getLabelTasks(mutation.payload as WorkflowNode[]);
      updateLabels({ commit: store.commit, state }, labelTasks);
    }
    if (mutation.type === `workflow/${workflowTypes.SET_NODES}`) {
      const nodes = state.workflow.nodes as WorkflowNode[];
      const { taskWindows } = state;
      const taskWindowsUpdated = getUpdatedTaskWindows(taskWindows, nodes);
      store.commit(types.SET_TASK_WINDOWS, taskWindowsUpdated);
    }
  });
};

const plugins = [plugin];

export default plugins;

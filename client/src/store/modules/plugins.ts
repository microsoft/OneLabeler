import { Store } from 'vuex';
import {
  ILabel,
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
  if (!containsClassification && !containsObjectDetection && !containsSegmentation) {
    commit(types.SET_LABELS, []);
    return;
  }

  if (state.labels.length !== state.dataObjects.length) {
    const labels: ILabel[] = Array(state.dataObjects.length)
      .fill(null).map((d, i) => ({
        uuid: state.dataObjects[i].uuid,
        category: containsClassification ? state.unlabeledMark : undefined,
        shapes: containsObjectDetection ? Array(0) : undefined,
        mask: containsSegmentation ? { path: null } : undefined,
      }));
    commit(types.SET_LABELS, labels);
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
      result.push({
        node,
        process,
        isPinned: match !== undefined ? match.isPinned : false,
        isMinimized: match !== undefined ? match.isMinimized : false,
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

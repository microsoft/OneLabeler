import { Store } from 'vuex';
import {
  LabelTaskType,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
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

  // Clear labelGeometricObjects
  if (!containsObjectDetection) {
    commit(types.SET_LABEL_GEOMETRIC_OBJECTS, null);
  }

  // Initialize labelGeometricObjects
  if (
    containsObjectDetection
    && (state.labelGeometricObjects === null
      || (state.labelGeometricObjects.length !== state.dataObjects.length))
  ) {
    const labelGeometricObjects = Array(state.dataObjects.length)
      .fill(null).map(() => Array(0));
    commit(types.SET_LABEL_GEOMETRIC_OBJECTS, labelGeometricObjects);
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

const plugin = (store: Store<IState>) => {
  store.subscribe((mutation, state: IState) => {
    if (mutation.type === types.SET_DATA_OBJECTS) {
      const labelTasks = getLabelTasks(state.workflow.nodes);
      updateLabels({ commit: store.commit, state }, labelTasks);
    }
    if (mutation.type === `workflow/${workflowTypes.SET_NODES}`) {
      const labelTasks = getLabelTasks(mutation.payload as WorkflowNode[]);
      updateLabels({ commit: store.commit, state }, labelTasks);
    }
  });
};

const plugins = [plugin];

export default plugins;

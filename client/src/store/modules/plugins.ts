import { Store } from 'vuex';
import {
  Process,
  TaskWindow,
  WorkflowNode,
} from '@/commons/types';
import { isNodeInteractive } from '@/commons/utils';
import { IState as IRootState } from './state';
import { IState as IWorkflowState } from './workflow/state';
import * as types from './mutation-types';
import * as workflowTypes from './workflow/mutation-types';

type IState = IRootState & { workflow: IWorkflowState };

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

const plugin = (store: Store<IState>): void => {
  store.subscribe(async (mutation, state: IState) => {
    if (mutation.type === types.SET_DATA_OBJECTS) {
      const { dataObjects } = state;
      if (dataObjects !== null) {
        const THRESHOLD = 2000;
        const nDataObjects = await dataObjects.count();
        if (nDataObjects >= THRESHOLD) {
          const collection = await dataObjects.slice(undefined, THRESHOLD);
          const uuids = collection.map((d) => d.uuid);
          store.commit(types.SET_SCOPE_UUIDS, uuids);
        } else {
          store.commit(types.SET_SCOPE_UUIDS, null);
        }
      }
    }
    if (mutation.type === `workflow/${workflowTypes.SET_NODES}`) {
      // Setting the nodes may change the label tasks
      // and thus changing the default labels.
      const { labels } = state;
      if (labels !== null) {
        store.commit(types.SET_LABELS, labels.shallowCopy());
      }
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

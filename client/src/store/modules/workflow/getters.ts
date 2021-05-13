import {
  DataType,
  LabelTaskType,
  Process,
  TaskWindow,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import { isNodeInteractive } from '@/commons/utils';
import { IState } from './state';

export const startNode = (state: IState): WorkflowNode | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.Initialization;
  const node = nodes.find((d) => d.type === type) as WorkflowNode;
  return node === undefined ? null : node;
};

export const nextNodes = (state: IState): WorkflowNode[] | null => {
  const { currentNode, edges, nodes } = state;
  if (currentNode === null) return null;
  const outputNodeIds = edges.filter(
    (edge) => edge.source === currentNode.id,
  ).map((edge) => edge.target);
  const outputNodes = outputNodeIds.map((id: string) => (
    nodes.find((d) => d.id === id) as WorkflowNode
  ));
  return outputNodes;
};

export const labelTasks = (state: IState): LabelTaskType[] => {
  const { nodes } = state;
  const type = WorkflowNodeType.Initialization;
  const node = nodes.find((d) => d.type === type);
  if (node === undefined) return [];
  return (node.value as { labelTasks: LabelTaskType[] }).labelTasks;
};

export const dataType = (state: IState): DataType | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.Initialization;
  const node = nodes.find((d) => d.type === type);
  if (node === undefined) return null;
  return (node.value as { dataType: DataType }).dataType;
};

export const processesValid = (state: IState): Process[] => {
  const { processes } = state;
  const dataTypeValue = dataType(state);
  return processes.filter((d) => {
    if (d.dataTypes === undefined) return true;
    return d.dataTypes.findIndex((type) => type === dataTypeValue) >= 0;
  });
};

export const taskWindows = (state: IState): TaskWindow[] => {
  const { nodes } = state;
  const nodesWithInterface = nodes.filter((d) => isNodeInteractive(d));
  const result: TaskWindow[] = [];
  nodesWithInterface.forEach((node) => {
    if (Array.isArray(node.value)) {
      node.value.forEach((process) => {
        result.push({ node, process });
      });
    } else {
      result.push({ node, process: node.value as Process });
    }
  });
  return result;
};

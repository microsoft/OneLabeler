import {
  DataType,
  LabelTaskType,
  Process,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import { IState } from './state';

export const startNode = (state: IState): WorkflowNode | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.Initialization;
  const node = nodes.find((d) => d.type === type) as WorkflowNode;
  return node ?? null;
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
  return node?.value?.dataType ?? null;
};

export const processesValid = (state: IState): Process[] => {
  const { processes } = state;
  const dataTypeValue = dataType(state);
  const labelTasksValue = labelTasks(state);
  return processes.filter((d) => {
    if (d.dataTypes === undefined && d.labelTasks === undefined) return true;
    const dataTypeMatch = dataTypeValue === null || d.dataTypes?.includes(dataTypeValue);
    if (d.labelTasks === undefined || d.labelTasks === null) return dataTypeMatch;
    const union = d.labelTasks.filter((t) => labelTasksValue.includes(t));
    const labelTasksMatch = union.length >= 1;
    return dataTypeMatch && labelTasksMatch;
  });
};

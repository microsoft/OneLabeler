import {
  DataType,
  LabelTaskType,
  Process,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import { IState } from './state';

export const startNode = (state: IState): WorkflowNode => {
  const { nodes } = state;
  const type = WorkflowNodeType.Initialization;
  const node = nodes.find((d) => d.type === type) as WorkflowNode;
  return node;
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

export const dataObjectSelectionMethods = (
  state: IState,
): Process[] | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.DataObjectSelection;
  const processes = nodes.filter((d) => d.type === type)
    .map((d) => d.value).flat() as Process[];
  return processes;
};

export const interactiveLabelingMethods = (
  state: IState,
): Process[] | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.InteractiveLabeling;
  const processes = nodes.filter((d) => d.type === type)
    .map((d) => d.value).flat() as Process[];
  return processes;
};

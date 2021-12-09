import { lintWorkflow, LintMessageType } from '@/commons/workflow-utils/lint-workflow';
import type { LintMessage } from '@/commons/workflow-utils/lint-workflow';
import { WorkflowNodeType } from '@/commons/types';
import type {
  DataType,
  LabelTaskType,
  IModule,
  WorkflowNode,
  IInitializationNode,
} from '@/commons/types';
import type { IState } from './state';

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
  const node = nodes.find((d) => d.type === type) as IInitializationNode | undefined;
  return node?.value?.params.labelTasks.value ?? [];
};

export const dataType = (state: IState): DataType | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.Initialization;
  const node = nodes.find((d) => d.type === type) as IInitializationNode | undefined;
  return node?.value?.params.dataType.value ?? null;
};

export const validModules = (state: IState): IModule[] => {
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

export const consoleMessages = (state: IState): LintMessage[] => {
  const messages = lintWorkflow({
    nodes: state.nodes,
    edges: state.edges,
  });
  if (messages.length === 0) {
    return [{
      subjects: [],
      message: '🚀 The workflow is valid',
      type: LintMessageType.Success,
    }];
  }
  return messages;
};

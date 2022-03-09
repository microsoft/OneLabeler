import { WorkflowEdge, WorkflowNode, WorkflowNodeType } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';
import bfs from '../utils/bfs';

/** Check all the nodes can be reached from the initialization node. */
const checkNodeReachedByInitialization = (
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  // Only one initialization node should exist.
  const initializationNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Initialization
  ));
  if (initializationNodes.length !== 1) return [];
  const [initializationNode] = initializationNodes;

  const visitedNodes = bfs(initializationNode, { nodes, edges });
  const allNodesVisited = visitedNodes.length === nodes.length;
  if (!allNodesVisited) {
    const visitedNodeIds = new Set(visitedNodes.map((d) => d.id));
    const unreachableNodes = nodes.filter((d) => !visitedNodeIds.has(d.id));
    unreachableNodes.forEach((node) => {
      messages.push({
        type: LintMessageType.Error,
        message: `node with label "${
          node.label
        }" unreachable from the initialization node`,
        category: ErrorCategory.TopologyError,
        subjects: [node],
        rule: 'no-isolated-node',
        fixes: [`create an inward edge from another node to the node with label "${node.label}"`],
      });
    });
  }

  return messages;
};

export default checkNodeReachedByInitialization;

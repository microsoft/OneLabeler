import type { WorkflowNode, WorkflowEdge } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';

/** Check all the edge vertices exist in the node list. */
const checkEdgeVertexIdsExist = (
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  // The set of valid node ids.
  const nodeIds: Set<string> = new Set(nodes.map((d) => d.id));
  edges.forEach((edge) => {
    const { source, target } = edge;
    if (!nodeIds.has(source)) {
      messages.push({
        type: LintMessageType.Error,
        message: `edge source node with id "${
          source
        }" does not exist`,
        category: ErrorCategory.DataStructureError,
        subjects: [edge],
        rule: 'Disallow Invalid Edge Source',
        fixes: ['remove this edge'],
      });
    }
    if (!nodeIds.has(target)) {
      messages.push({
        type: LintMessageType.Error,
        message: `edge target node with id "${
          source
        }" does not exist`,
        category: ErrorCategory.DataStructureError,
        subjects: [edge],
        rule: 'Disallow Invalid Edge Target',
        fixes: ['remove this edge'],
      });
    }
  });

  return messages;
};

export default checkEdgeVertexIdsExist;

import type { WorkflowNode, WorkflowEdge } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';

/** Check all the edge vertices exist in the node list. */
const checkEdgeVertexIdsExist = (
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  const nodeIds: Set<string> = new Set(nodes.map((d) => d.id));
  edges.forEach((edge) => {
    const { source, target } = edge;
    if (!nodeIds.has(source)) {
      messages.push({
        subjects: [edge],
        message: `edge source node with id "${
          source
        }" does not exist (Edge Source Invalid)`,
        type: LintMessageType.Error,
        category: ErrorCategory.DataStructureError,
      });
    }
    if (!nodeIds.has(target)) {
      messages.push({
        subjects: [edge],
        message: `edge target node with id "${
          source
        }" does not exist (Edge Target Invalid)`,
        type: LintMessageType.Error,
        category: ErrorCategory.DataStructureError,
      });
    }
  });

  return messages;
};

export default checkEdgeVertexIdsExist;

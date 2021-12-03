import type { WorkflowNode } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';

/** Check all the nodes have unique ids. */
const checkNodeIdsUnique = (
  { nodes }: { nodes: WorkflowNode[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  // Store the mapping from id to indices of nodes with the id.
  const nodeIdToIndices: Record<string, number[]> = {};
  nodes.forEach(({ id }, i) => {
    nodeIdToIndices[id] = [
      ...(id in nodeIdToIndices ? nodeIdToIndices[id] : []),
      i,
    ];
  });

  Object.entries(nodeIdToIndices).forEach(([id, indices]) => {
    if (indices.length === 1) return;
    // The nodes that share the same id.
    const subjects = indices.map((i) => nodes[i]);
    const nodeNames = subjects.map((d) => `"${d.label}"`).join(', ');
    messages.push({
      type: LintMessageType.Error,
      message: `${indices.length} nodes with labels ${nodeNames} have the same id "${id}"`,
      category: ErrorCategory.DataStructureError,
      subjects,
      rule: 'Node ID Not Unique',
      fixes: [`Consider removing the nodes with labels ${nodeNames}`],
    });
  });

  return messages;
};

export default checkNodeIdsUnique;

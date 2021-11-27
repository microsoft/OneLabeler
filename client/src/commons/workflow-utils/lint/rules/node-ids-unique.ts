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
    nodeIdToIndices[id] = id in nodeIdToIndices
      ? [...nodeIdToIndices[id], i]
      : [i];
  });

  Object.entries(nodeIdToIndices).forEach(([id, indices]) => {
    if (indices.length === 1) return;
    // The nodes that share the same id.
    const subjects = indices.map((i) => nodes[i]);
    messages.push({
      subjects,
      message: `${indices.length} nodes with labels ${
        subjects.map((d) => `"${d.label}"`).join(', ')
      } have the same id "${id}" (Node ID Not Unique)`,
      type: LintMessageType.Error,
      category: ErrorCategory.DataStructureError,
    });
  });

  return messages;
};

export default checkNodeIdsUnique;

import type { WorkflowNode, WorkflowEdge } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';

/** Check none of the nodes has self loops. */
const checkNoSelfLoops = (
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  edges.forEach((edge) => {
    const { source, target } = edge;
    if (source !== target) return;
    const node = nodes.find((d) => d.id === source);
    if (node === undefined) return;
    messages.push({
      subjects: [node],
      message: `node with label "${node.label}" has self loop (Disallow Self Loops)`,
      type: LintMessageType.Error,
      category: ErrorCategory.TopologyError,
    });
  });

  return messages;
};

export default checkNoSelfLoops;

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
      type: LintMessageType.Error,
      message: `node with label "${node.label}" has self loop`,
      category: ErrorCategory.TopologyError,
      subjects: [node],
      rule: 'Disallow Self Loops',
      fixes: [`remove the self loop on the node with label "${node.label}"`],
    });
  });

  return messages;
};

export default checkNoSelfLoops;

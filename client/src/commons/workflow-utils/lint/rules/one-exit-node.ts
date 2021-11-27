import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowNode } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';

/** Check the graph contains one initialization node. */
const checkOneExitNode = (
  { nodes }: { nodes: WorkflowNode[] },
): LintMessage[] => {
  const exitNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Exit
  ));
  if (exitNodes.length !== 1) {
    return [{
      subjects: exitNodes,
      message: `found ${exitNodes.length} exit nodes (Need One Exit Node)`,
      type: LintMessageType.Error,
      category: ErrorCategory.TopologyError,
    }];
  }

  return [];
};

export default checkOneExitNode;

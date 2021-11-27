import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowNode } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';

/** Check the graph contains one initialization node. */
const checkOneInitializationNode = (
  { nodes }: { nodes: WorkflowNode[] },
): LintMessage[] => {
  const initializationNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Initialization
  ));
  if (initializationNodes.length !== 1) {
    return [{
      subjects: initializationNodes,
      message: `found ${initializationNodes.length} initialization nodes (Need One Initialization Node)`,
      type: LintMessageType.Error,
      category: ErrorCategory.TopologyError,
    }];
  }

  return [];
};

export default checkOneInitializationNode;

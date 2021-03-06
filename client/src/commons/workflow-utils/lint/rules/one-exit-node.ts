// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
      type: LintMessageType.Error,
      message: `found ${exitNodes.length} exit nodes`,
      category: ErrorCategory.TopologyError,
      subjects: exitNodes,
      rule: 'should-have-one-exit-node',
      fixes: [
        exitNodes.length === 0
          ? 'create an exit node'
          : 'remove an exit node',
      ],
    }];
  }

  return [];
};

export default checkOneExitNode;

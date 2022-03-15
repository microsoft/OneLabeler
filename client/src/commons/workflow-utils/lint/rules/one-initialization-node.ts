// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
      type: LintMessageType.Error,
      message: `found ${initializationNodes.length} initialization nodes`,
      category: ErrorCategory.TopologyError,
      subjects: initializationNodes,
      rule: 'should-have-one-initialization-node',
      fixes: [
        initializationNodes.length === 0
          ? 'create an initialization node'
          : 'remove an initialization node',
      ],
    }];
  }

  return [];
};

export default checkOneInitializationNode;

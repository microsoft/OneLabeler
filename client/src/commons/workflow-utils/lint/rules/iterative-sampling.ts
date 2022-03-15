// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowEdge, WorkflowNode } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';
import getLoops from '../utils/loops';

/** Check that data object selection is conducted iteratively. */
const checkIterativeSampling = (
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  const dataObjectSelectionNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.DataObjectSelection
  ));
  if (dataObjectSelectionNodes.length === 0) {
    return [{
      type: LintMessageType.Warning,
      message: 'no data object selection node (i.e., the samples will never be updated)',
      category: ErrorCategory.TopologyError,
      subjects: [],
      rule: 'prefer-selection-in-the-loop',
      fixes: ['consider whether to create a data object selection node'],
    }];
  }

  const selectionLoops = dataObjectSelectionNodes
    .map((d) => getLoops(d, { nodes, edges }));
  if (selectionLoops.every((d) => d.length === 0)) {
    messages.push({
      type: LintMessageType.Warning,
      message: 'no data object selection node in loops (i.e., the samples will never be updated)',
      category: ErrorCategory.AntiPattern,
      subjects: dataObjectSelectionNodes,
      rule: 'prefer-selection-in-the-loop',
      fixes: ['consider whether to put a data object selection node in a loop'],
    });
  }

  return messages;
};

export default checkIterativeSampling;

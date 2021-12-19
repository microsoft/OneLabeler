import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowEdge, WorkflowNode } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';
import getLoops from '../utils/loops';

const containsModelTraining = (nodes: WorkflowNode[]): boolean => (
  nodes.find((d) => d.type === WorkflowNodeType.ModelTraining) !== undefined
);

/** Check that model is iteratively updated. */
const checkIterativeTraining = (
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  // Find modules in loops
  // If a loop has a module that depends on model,
  // the loop is recommended to have a model training module.
  nodes.forEach((node) => {
    if (node.value === null) return;
    const { inputs, outputs } = node.value;
    if (!inputs.includes('model') || outputs.includes('model')) return;
    const loops = getLoops(node, { nodes, edges });
    loops.forEach((loop) => {
      if (containsModelTraining(loop)) return;
      messages.push({
        type: LintMessageType.Warning,
        message: `node with label "${
          node.label
        }" requires model but the model is not iteratively updated in a loop`,
        category: ErrorCategory.AntiPattern,
        subjects: [node],
        rule: 'prefer-incrementally-update-models',
        fixes: ['consider whether to add model training in a loop that contains this node'],
      });
    });
  });

  return messages;
};

export default checkIterativeTraining;

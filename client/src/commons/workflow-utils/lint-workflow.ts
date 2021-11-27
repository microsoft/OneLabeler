import type { WorkflowEdge, WorkflowNode } from '@/commons/types';
import rules from './lint/rules';
import type { LintMessage } from './lint/types';

export { ErrorCategory, LintMessageType, LintMessage } from './lint/types';

/** Semantic linting of the workflow graph. */
export const lintWorkflow = (
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): LintMessage[] => {
  // TODO: implement soft recommendations
  // e.g., for object detection and segmentation tasks, single object display should be recommended

  let messages: LintMessage[] = [];
  rules.some((rule) => {
    messages = rule({ nodes, edges });
    return messages.length !== 0;
  });
  return messages;
};

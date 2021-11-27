import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowEdge, WorkflowNode } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';
import getPaths from '../utils/paths';

/** Check that all modules' inputs are initialized for all executions. */
const checkModuleInputsInitialized = (
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  // Should have one initialization node and one exit node
  const initializationNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Initialization
  ));
  if (initializationNodes.length !== 1) return messages;
  const [initializationNode] = initializationNodes;
  const exitNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Exit
  ));
  if (exitNodes.length !== 1) return messages;
  const [exitNode] = exitNodes;

  const paths = getPaths(
    initializationNode,
    exitNode,
    { nodes, edges },
  );
  paths.forEach((path): void => {
    const initializedStates: Set<string> = new Set([]);
    path.forEach((node): void => {
      if (node.value === null || node.value === undefined) return;
      const { inputs, outputs } = node.value;

      // The states not initialized but used as inputs.
      const notInitializedInputs = inputs.filter((d) => !initializedStates.has(d));
      if (notInitializedInputs.length !== 0) {
        messages.push({
          subjects: [node],
          message: `node with label "${
            node.label
          }" has uninitialized inputs ${
            notInitializedInputs.map((d) => `"${d}"`).join(', ')
          } (States Should Be Initialized Before Used)`,
          type: LintMessageType.Error,
          category: ErrorCategory.ImplementationError,
        });
      }
      outputs.forEach((d) => initializedStates.add(d));
    });
  });

  return messages;
};

export default checkModuleInputsInitialized;

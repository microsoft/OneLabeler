import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowEdge, WorkflowNode } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';
import getPaths from '../utils/paths';

const isOverlapping = (a: Set<unknown>, b: Set<unknown>): boolean => {
  const delta = new Set([...a, ...b]).size - a.size - b.size;
  return delta !== 0;
};

/** Check that all modules' outputs are not redundant. */
const checkModuleNoRedundancy = (
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

  // - After state A is modified, it should not be modified again until it is used:
  // Between two modules A and B that output
  // the sames state, assume A is executed before B in the execution.
  // Then, there should exist module(s) between A and B (with A excluded and B included)
  // that used module A's output as an input state.
  // Otherwise, there's no need to have module A in the workflow.
  paths.forEach((path): void => {
    const unmodifiableStates: Set<string> = new Set([]);
    path.forEach((node): void => {
      if (node.value === null || node.value === undefined) return;
      const { inputs, outputs } = node.value;
      inputs.forEach((d) => unmodifiableStates.delete(d));

      // The states that shouldn't be modified but modified by output.
      const unmodifiableOutputs = outputs.filter((d) => unmodifiableStates.has(d));
      if (unmodifiableOutputs.length !== 0) {
        messages.push({
          subjects: [node],
          message: `node with label "${
            node.label
          }" output overwrites unused state(s) ${
            unmodifiableOutputs.map((d) => `"${d}"`).join(', ')
          } (States Should Be Used Before Overwritten)`,
          type: LintMessageType.Error,
          category: ErrorCategory.ImplementationError,
        });
      }
      outputs.forEach((d) => unmodifiableStates.add(d));
    });
  });

  // - After module A is visited, it should not be visited again
  // until at least one of its input parameters has been changed:
  // Between two modules A and B that output
  // the sames state, assume A is executed before B in the execution.
  // Then, there should exist module(s) between A and B (with A included and B excluded)
  // that output(s) the input of B.
  // Otherwise, there's no need to have module B in the workflow.
  paths.forEach((path): void => {
    const unvisitableNodes: Map<string, WorkflowNode> = new Map();
    path.forEach((node): void => {
      if (node.value === null || node.value === undefined) return;
      const { inputs, outputs } = node.value;
      if (unvisitableNodes.has(node.id)) {
        messages.push({
          subjects: [node],
          message: `node with label "${
            node.label
          }" revisited before its input(s) is edited (Module Inputs Be Edited Before Revisit)`,
          type: LintMessageType.Error,
          category: ErrorCategory.ImplementationError,
        });
      }

      // Allow visiting the nodes whose inputs are edited after last execution.
      [...unvisitableNodes.entries()].forEach(([key, { value }]) => {
        if (value === null) return;
        if (isOverlapping(new Set(value.inputs), new Set(outputs))) {
          unvisitableNodes.delete(key);
        }
      });

      // Disallow visiting the current node
      // (until at least one of its inputs have been edited).
      if (!isOverlapping(new Set(inputs), new Set(outputs))) {
        unvisitableNodes.set(node.id, node);
      }
    });
  });

  return messages;
};

export default checkModuleNoRedundancy;

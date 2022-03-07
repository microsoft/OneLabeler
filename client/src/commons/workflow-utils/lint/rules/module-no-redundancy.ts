import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowEdge, WorkflowNode } from '@/commons/types';
import { filterNodeTypesByInputs, filterNodeTypesByOutputs } from '../../build-node';
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

  // - After a node is visited, it should not be visited again
  // until at least one of its input parameters has been changed.
  paths.forEach((path): void => {
    const unvisitableNodes: Map<string, WorkflowNode> = new Map();
    path.forEach((node): void => {
      if (node.value === null || node.value === undefined) return;
      const { inputs, outputs } = node.value;
      if (unvisitableNodes.has(node.id)) {
        messages.push({
          type: LintMessageType.Error,
          message: `node with label "${
            node.label
          }" revisited before its input${
            inputs.length === 1 ? ' is' : 's are'
          } edited`,
          category: ErrorCategory.ImplementationError,
          subjects: [node],
          rule: 'no-repetitive-function-call',
          fixes: [
            'move the node outside of the loop to avoid revisiting it',
            ...inputs.map((input): string[] => {
              const nodeTypes = filterNodeTypesByOutputs([input])
                .filter((type) => type.value.type !== WorkflowNodeType.Initialization);
              return nodeTypes.map((type) => (
                `add ${type.name} to the loop to modify ${input}`
              ));
            }).flat(),
          ],
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

  // - After node A is visited, at least one of its outputs should be consumed:
  // For each path from A to the exit node,
  // at least one of A's output has been used as input(s) to node visited along the path.
  // Otherwise, there's no need to have node A in the workflow.
  paths.forEach((path): void => {
    let unusedOutputs: [string, WorkflowNode][] = [];
    path.forEach((node): void => {
      if (node.value === null || node.value === undefined) return;
      const { inputs, outputs } = node.value;
      inputs.forEach((d) => {
        unusedOutputs = unusedOutputs.filter(([key]) => key !== d);
      });
      outputs.forEach((d) => {
        unusedOutputs = [...unusedOutputs, [d, node]];
      });
    });
    unusedOutputs.forEach(([output, node]) => {
      messages.push({
        type: LintMessageType.Error,
        message: `output ${output} of node with label "${
          node.label
        }" not used by its following nodes`,
        category: ErrorCategory.ImplementationError,
        subjects: [node],
        // rule: 'consume-module-outputs',
        rule: 'no-unused-function-return',
        fixes: [
          `remove ${output} from the outputs of this node if the outputs of this node is customizable`,
          ...filterNodeTypesByInputs([output]).map((type) => (
            `add ${type.name} after this node is visited to consume ${output}`
          )),
        ],
      });
    });
  });

  // - After a state is modified, it should not be modified again until it is used:
  // Between two nodes A and B that output
  // the sames state, assume A is executed before B in the execution.
  // Then, there should exist node(s) between A and B (with A excluded and B included)
  // that used node A's output as an input state.
  // Otherwise, there's no need to have node A in the workflow.
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
          type: LintMessageType.Error,
          message: `node with label "${
            node.label
          }" output overwrites unused state${
            unmodifiableOutputs.length === 1 ? '' : 's'
          } ${
            unmodifiableOutputs.map((d) => `"${d}"`).join(', ')
          }`,
          category: ErrorCategory.ImplementationError,
          subjects: [node],
          // rule: 'use-states-before-overwritten',
          rule: 'no-unused-function-return',
          fixes: [
            `remove the node with label "${node.label}"`,
            ...outputs.map((output): string[] => {
              const nodeTypes = filterNodeTypesByInputs([output]);
              return nodeTypes.map((type) => (
                `add ${type.name} after this node is visited to consume ${
                  output} before ${output} is overwritten`
              ));
            }).flat(),
          ],
        });
      }
      outputs.forEach((d) => unmodifiableStates.add(d));
    });
  });

  return messages;
};

export default checkModuleNoRedundancy;

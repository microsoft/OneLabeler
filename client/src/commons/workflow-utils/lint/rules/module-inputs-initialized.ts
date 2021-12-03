import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowEdge, WorkflowNode } from '@/commons/types';
import { filterNodeTypesByOutputs } from '../../build-node';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';
import getPaths from '../utils/paths';

/**
 * Filter the message when all the subjects of the message
 * have been mentioned in other messages.
 */
const filterDuplicate = (messages: LintMessage[]): LintMessage[] => {
  const filteredMessages: LintMessage[] = [];
  const visitedIds: Set<string> = new Set([]);
  messages.forEach((message) => {
    const subjectsAllVisited = message.subjects !== undefined
      && message.subjects.every((subject) => visitedIds.has(subject.id));
    if (!subjectsAllVisited) filteredMessages.push(message);
    message.subjects?.forEach((subject) => visitedIds.add(subject.id));
  });
  return filteredMessages;
};

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
          type: LintMessageType.Error,
          message: `node with label "${
            node.label
          }" has uninitialized inputs ${
            notInitializedInputs.map((d) => `"${d}"`).join(', ')
          }`,
          category: ErrorCategory.ImplementationError,
          subjects: [node],
          rule: 'States Should Be Initialized Before Used',
          fixes: notInitializedInputs.map((input): string[] => {
            const nodeTypes = filterNodeTypesByOutputs([input]);
            return nodeTypes.map((typeName) => (
              `May consider to add ${typeName} before this node is visited to initialize ${input}.`
            ));
          }).flat(),
        });
      }
      outputs.forEach((d) => initializedStates.add(d));
    });
  });

  return filterDuplicate(messages);
};

export default checkModuleInputsInitialized;

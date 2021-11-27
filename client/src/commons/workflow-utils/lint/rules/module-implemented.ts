import { WorkflowNodeType } from '@/commons/types';
import type { Process, WorkflowNode } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';

/** Check that for all the nodes, the implementations are chosen. */
const checkModuleImplemented = (
  { nodes }: { nodes: WorkflowNode[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  // Should have one initialization node
  const initializationNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Initialization
  ));
  if (initializationNodes.length !== 1) return messages;
  const [initializationNode] = initializationNodes;

  // For the initialization node, the data type should be chosen.
  const isDataTypeValid = initializationNode.value !== undefined
    && initializationNode.value !== null
    && 'dataType' in initializationNode.value;
  if (!isDataTypeValid) {
    messages.push({
      subjects: [initializationNode],
      message: 'data type not selected (Implementation Must Be Chosen)',
      type: LintMessageType.Error,
      category: ErrorCategory.ImplementationError,
    });
  }

  // For the initialization node, the label tasks should be chosen.
  const isLabelTasksValid = initializationNode.value !== undefined
    && initializationNode.value !== null
    && 'labelTasks' in initializationNode.value
    && Array.isArray(initializationNode.value.labelTasks)
    && initializationNode.value.labelTasks.length !== 0;
  if (!isLabelTasksValid) {
    messages.push({
      subjects: [initializationNode],
      message: 'label task(s) not selected (Implementation Must Be Chosen)',
      type: LintMessageType.Error,
      category: ErrorCategory.ImplementationError,
    });
  }

  // All the modules must have one implementation chosen
  nodes.forEach((node) => {
    if (node.type === WorkflowNodeType.Initialization) return;
    if (node.type === WorkflowNodeType.Decision) return;
    if (node.type === WorkflowNodeType.Exit) return;

    const instance = node.value as Process | null;

    // Check an implementation is chosen for the node.
    const isModuleImplemented = instance !== null
      && (
        (instance.run !== undefined && instance.run !== null)
        || (instance.render !== undefined && instance.render !== null)
        || (instance.api !== undefined && instance.api !== null && instance.api !== '')
      );
    if (!isModuleImplemented) {
      messages.push({
        subjects: [node],
        message: `Implementation is not chosen for node with label "${
          node.label
        }" (Implementation Must Be Chosen)`,
        type: LintMessageType.Error,
        category: ErrorCategory.ImplementationError,
      });
    }
  });

  return messages;
};

export default checkModuleImplemented;

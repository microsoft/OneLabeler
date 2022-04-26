// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WorkflowNodeType } from '@/commons/types';
import type { IInitializationNode, WorkflowNode } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';
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
  )) as IInitializationNode[];
  if (initializationNodes.length !== 1) return messages;
  const [initializationNode] = initializationNodes;

  // For the initialization node, the data type should be chosen.
  const isDataTypeValid = initializationNode.value !== undefined
    && initializationNode.value !== null
    && initializationNode.value.params.dataType.value !== null
    && initializationNode.value.params.dataType.value !== undefined;
  if (!isDataTypeValid) {
    messages.push({
      type: LintMessageType.Error,
      message: 'data type not selected',
      category: ErrorCategory.ImplementationError,
      subjects: [initializationNode],
      rule: 'should-choose-implementation',
      fixes: ['choose the data type in the initialization node'],
    });
  }

  // For the initialization node, the label tasks should be chosen.
  const isLabelTasksValid = initializationNode.value !== undefined
    && initializationNode.value !== null
    && Array.isArray(initializationNode.value.params.labelTasks.value)
    && initializationNode.value.params.labelTasks.value.length !== 0;
  if (!isLabelTasksValid) {
    messages.push({
      type: LintMessageType.Error,
      message: 'label task(s) not selected',
      category: ErrorCategory.ImplementationError,
      subjects: [initializationNode],
      rule: 'should-choose-implementation',
      fixes: ['choose the label task type(s) in the initialization node'],
    });
  }

  // All the modules must have one implementation chosen
  nodes.forEach((node) => {
    if (node.type === WorkflowNodeType.Initialization) return;
    if (node.type === WorkflowNodeType.Decision) return;
    if (node.type === WorkflowNodeType.Exit) return;

    const instance = node.value as BaseModule | null;

    // Check an implementation is chosen for the node.
    const isModuleImplemented = instance !== null
      && ((instance.run !== undefined) || (instance.run !== undefined))
      && (
        !instance.inputs.includes('model')
        || (instance.model !== undefined && instance.model !== null)
      );
    if (!isModuleImplemented) {
      messages.push({
        type: LintMessageType.Error,
        message: `Implementation is not chosen for node with label "${
          node.label
        }"`,
        category: ErrorCategory.ImplementationError,
        subjects: [node],
        rule: 'should-choose-implementation',
        fixes: ['configure the implementation for this node in the panel on the right'],
      });
    }
  });

  return messages;
};

export default checkModuleImplemented;

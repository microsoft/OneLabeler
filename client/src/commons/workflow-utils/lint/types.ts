// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { WorkflowEdge, WorkflowNode } from '@/commons/types';

export enum LintMessageType {
  Error = 'Error',
  Warning = 'Warning',
  Success = 'Success',
}

export enum ErrorCategory {
  DataStructureError = 'DataStructureError',
  TopologyError = 'TopologyError',
  ImplementationError = 'ImplementationError',
  AntiPattern = 'AntiPattern',
}

export interface LintMessage {
  type: LintMessageType;
  /** The lint message. */
  message: string;
  category?: ErrorCategory;
  subjects?: (WorkflowNode | WorkflowEdge)[];
  /** The lint rule. */
  rule?: string;
  /** The recommended fixes. */
  fixes?: string[];
}

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
}

export interface LintMessage {
  subjects: (WorkflowNode | WorkflowEdge)[];
  message: string;
  type: LintMessageType;
  category?: ErrorCategory;
}

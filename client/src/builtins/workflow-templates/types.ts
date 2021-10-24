import type { DataType } from '@/builtins/data-types/types';
import type { LabelTaskType } from '@/builtins/label-task-types/types';
import type { Process } from '@/builtins/modules/types';

export enum WorkflowNodeType {
  Initialization = 'Initialization',
  LabelIdeation = 'LabelIdeation',
  FeatureExtraction = 'FeatureExtraction',
  DataObjectSelection = 'DataObjectSelection',
  DefaultLabeling = 'DefaultLabeling',
  InteractiveLabeling = 'InteractiveLabeling',
  StoppageAnalysis = 'StoppageAnalysis',
  ModelTraining = 'ModelTraining',
  QualityAssurance = 'QualityAssurance',
  Custom = 'Custom',
  Decision = 'Decision',
  Exit = 'Exit',
}

export type InitializationParams = {
  dataType: DataType | null;
  labelTasks: LabelTaskType[];
}

export type WorkflowNode = {
  id: string;
  label: string;
  type: WorkflowNodeType;
  value: Process // for node with a single instantiation
    | Process[] // for node with multiple concurrent instantiations
    | InitializationParams // for initialization node
    | null // for node with a single instantiation not yet chosen
    | undefined; // for decision and exit nodes
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export enum PortDirection {
  Top = 'Top',
  Left = 'Left',
  Bottom = 'Bottom',
  Right = 'Right',
}

export type WorkflowEdge = {
  source: string;
  target: string;
  id: string;
  condition?: boolean;
  layout: {
    source: {
      direction: PortDirection,
      dx: number;
      dy: number;
    },
    target: {
      direction: PortDirection,
      dx: number;
      dy: number;
    }
  };
}

export type WorkflowGraph = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  /** The name of the workflow as appear in the menu. */
  label?: string;
}

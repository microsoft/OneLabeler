import type {
  DataType,
  LabelTaskType,
  ParamSpecification,
  IModule,
} from '@/commons/types';

export enum WorkflowNodeType {
  Initialization = 'Initialization',
  Decision = 'Decision',
  Exit = 'Exit',
  Base = 'Base',
  LabelIdeation = 'LabelIdeation',
  FeatureExtraction = 'FeatureExtraction',
  DataObjectSelection = 'DataObjectSelection',
  DefaultLabeling = 'DefaultLabeling',
  InteractiveLabeling = 'InteractiveLabeling',
  StoppageAnalysis = 'StoppageAnalysis',
  ModelTraining = 'ModelTraining',
  QualityAssurance = 'QualityAssurance',
}

export interface WorkflowNode {
  id: string;
  label: string;
  type: WorkflowNodeType;
  /** The chosen implementation (null when not chosen.) */
  value: IModule | null;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface IInitializationNode extends WorkflowNode {
  value: null | (Exclude<IModule, 'params'> & {
    params: {
      dataType: ParamSpecification<DataType, false>,
      labelTasks: ParamSpecification<LabelTaskType, true>,
    }
  })
}

export enum PortDirection {
  Top = 'Top',
  Left = 'Left',
  Bottom = 'Bottom',
  Right = 'Right',
}

export type WorkflowEdge = {
  // The id of the source node.
  source: string;
  // The id of the target node.
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

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
  /** The id of the node. */
  id: string;
  /** The name of the node as appear in the interface. */
  label: string;
  type: WorkflowNodeType;
  /** The chosen implementation (null when not chosen). */
  value: IModule | null;
  /**
   * The layout specifying where the node should
   * be rendered and the size of the node.
   */
  layout: {
    /** The position of the top left corner of the node. */
    x: number;
    y: number;
    /** The size of the node. */
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

/**
 * The type of relative position (as discrete state) of the port
 * in the node containing the port.
 */
export enum PortDirection {
  Top = 'Top',
  Left = 'Left',
  Bottom = 'Bottom',
  Right = 'Right',
}

export type WorkflowEdge = {
  /** The id of the source node. */
  source: string;
  /** The id of the target node. */
  target: string;
  /** The id of the edge itself. */
  id: string;
  /** The condition bound to the edge for outward edges of conditional branching. */
  condition?: boolean;
  /** The layout specifying where the edge should be rendered in the interface. */
  layout: {
    source: {
      /**
       * The relative position (as discrete state) of the port
       * in the node containing the port.
       */
      direction: PortDirection,
      /**
       * The relative position (in pixels) of the port
       * to the top left corner of the node containing the port.
       */
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

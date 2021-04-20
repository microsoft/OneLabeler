import {
  LabelTaskType,
  FeatureExtractionMethod,
  DefaultLabelingMethod,
  InterimModelTrainingMethod,
  InteractiveLabelingMethod,
  TaskTransformationType,
  StoppageAnalysisType,
  ModelService,
  DataObjectSelectionMethod,
} from '@/commons/types';

export enum NodeTypes {
  /** types of data object and label property */
  LabelTask = 'LabelTask',
  DataType = 'DataType',
  /** types of process */
  LabelIdeation = 'LabelIdeation',
  FeatureExtraction = 'FeatureExtraction',
  DataObjectSelection = 'DataObjectSelection',
  DefaultLabeling = 'DefaultLabeling',
  TaskTransformation = 'TaskTransformation',
  InteractiveLabeling = 'InteractiveLabeling',
  StoppageAnalysis = 'StoppageAnalysis',
  InterimModelTraining = 'InterimModelTraining',
  QualityAssurance = 'QualityAssurance',
  /** type of decision */
  Decision = 'Decision',
  /** type of initialization */
  Initialization = 'Initialization',
  /** type of terminal */
  Terminal = 'Terminal',
}

interface BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: unknown;
}

export interface LabelTaskNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: LabelTaskType[];
}

export interface FeatureExtractionNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: FeatureExtractionMethod,
  };
}

export interface DefaultLabelingNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: DefaultLabelingMethod,
    model?: ModelService,
  };
}

export interface InterimModelTrainingNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: InterimModelTrainingMethod,
  };
}

export interface InteractiveLabelingNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: InteractiveLabelingMethod,
  }[];
}

export interface DataObjectSelectionNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: DataObjectSelectionMethod,
    model?: ModelService,
  }[];
}

export interface TaskTransformationNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: TaskTransformationType,
  };
}

export interface StoppageAnalysisNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: StoppageAnalysisType,
    api: string,
  };
}

export type WorkflowNode = LabelTaskNode
  | FeatureExtractionNode
  | DataObjectSelectionNode
  | DefaultLabelingNode
  | TaskTransformationNode
  | InteractiveLabelingNode
  | StoppageAnalysisNode
  | InterimModelTrainingNode;

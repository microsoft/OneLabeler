import {
  LabelTaskType,
  ModelService,
  DataObjectSelectionMethod,
  DefaultLabelingMethod,
  FeatureExtractionMethod,
  InteractiveLabelingMethod,
  InterimModelTrainingMethod,
  TaskTransformationMethod,
  StoppageAnalysisMethod,
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

export interface DataObjectSelectionNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: DataObjectSelectionMethod,
    model?: ModelService,
  }[];
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

export interface FeatureExtractionNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: FeatureExtractionMethod,
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

export interface InterimModelTrainingNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: InterimModelTrainingMethod,
  };
}

export interface StoppageAnalysisNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: StoppageAnalysisMethod,
  };
}

export interface TaskTransformationNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: TaskTransformationMethod,
  };
}

export type WorkflowNode = LabelTaskNode
  | DataObjectSelectionNode
  | DefaultLabelingNode
  | FeatureExtractionNode
  | InteractiveLabelingNode
  | InterimModelTrainingNode
  | StoppageAnalysisNode
  | TaskTransformationNode;

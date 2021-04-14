import {
  LabelTaskType,
  FeatureExtractionMethod,
  DefaultLabelingMethodType,
  SamplingStrategyType,
  TaskTransformationType,
  StoppageAnalysisType,
  InterimModelTrainingType,
} from '@/commons/types';

export enum NodeTypes {
  /** types of data object and label property */
  labelTask = 'labelTask',
  dataType = 'dataType',
  /** types of process */
  labelIdeation = 'labelIdeation',
  featureExtraction = 'featureExtraction',
  dataObjectSelection = 'dataObjectSelection',
  defaultLabeling = 'defaultLabeling',
  taskTransformation = 'taskTransformation',
  interactiveLabeling = 'interactiveLabeling',
  stoppageAnalysis = 'stoppageAnalysis',
  interimModelTraining = 'interimModelTraining',
  qualityAssurance = 'qualityAssurance',
  /** type of decision */
  decision = 'decision',
  /** type of initialization */
  initialization = 'initialization',
  /** type of terminal */
  terminal = 'terminal',
}

interface BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: any;
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
  value: FeatureExtractionMethod;
}

export interface DataObjectSelectionNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    strategy: SamplingStrategyType,
    nBatch: number,
    api: string,
    projectionAidEnabled: boolean,
  };
}

export interface DefaultLabelingNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: DefaultLabelingMethodType,
    api: string,
  };
}

export interface TaskTransformationNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    method: TaskTransformationType,
  };
}

export interface InteractiveLabelingNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    singleObjectDisplayEnabled: boolean,
    gridMatrixEnabled: boolean,
    itemsPerRow: number,
    itemsPerCol: number,
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

export interface InterimModelTrainingNode extends BaseNode {
  id: string;
  title: string;
  type: NodeTypes;
  value: {
    enabled: boolean,
    method: InterimModelTrainingType,
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

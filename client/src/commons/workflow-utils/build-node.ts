/* eslint-disable max-classes-per-file */
import { Process, WorkflowNodeType } from '@/commons/types';

type Layout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class WorkflowNode {
  static possibleInputs: string[];

  static possibleOutputs: string[];

  id: string;

  label: string;

  type: WorkflowNodeType;

  value: Process;

  layout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  constructor(
    id: string,
    label: string,
    type: WorkflowNodeType,
    value: Process,
    layout: Layout,
  ) {
    this.id = id;
    this.label = label;
    this.type = type;
    this.value = value;
    this.layout = layout;
  }
}

export class DataLabelingWorkflowNode extends WorkflowNode {
  static possibleInputs: string[] = ['dataObjects', 'labels', 'queryUuids', 'features', 'model', 'stop'];

  static possibleOutputs: string[] = ['dataObjects', 'labels', 'queryUuids', 'features', 'model', 'stop'];
}

export class InitializationNode extends DataLabelingWorkflowNode {
  static possibleInputs: never[] = [];

  static type = WorkflowNodeType.Initialization;

  label = 'initialization';
}

export class DecisionNode extends DataLabelingWorkflowNode {
  static possibleInputs: string[] = ['stop'];

  static possibleOutputs: never[] = [];

  static type = WorkflowNodeType.Decision;

  label = 'decision';
}

export class ExitNode extends DataLabelingWorkflowNode {
  static possibleInputs: never[] = [];

  static possibleOutputs: never[] = [];

  static type = WorkflowNodeType.Exit;

  label = 'exit';
}

export class DataObjectSelectionNode extends DataLabelingWorkflowNode {
  static possibleInputs: string[] = ['dataObjects', 'labels', 'features', 'model', 'queryUuids'];

  static possibleOutputs: string[] = ['queryUuids'];

  static type = WorkflowNodeType.DataObjectSelection;

  label = 'data object selection';
}

export class DefaultLabelingNode extends DataLabelingWorkflowNode {
  static possibleInputs: string[] = ['queryUuids', 'features', 'model'];

  static possibleOutputs: string[] = ['labels'];

  static type = WorkflowNodeType.DefaultLabeling;

  label = 'default labeling';
}

export class FeatureExtractionNode extends DataLabelingWorkflowNode {
  static possibleInputs: string[] = ['dataObjects', 'labels', 'features', 'model'];

  static possibleOutputs: string[] = ['features'];

  static type = WorkflowNodeType.FeatureExtraction;

  label = 'feature extraction';
}

export class InteractiveLabelingNode extends DataLabelingWorkflowNode {
  static possibleInputs: string[] = ['dataObjects', 'labels', 'features', 'queryUuids', 'categories'];

  static possibleOutputs: string[] = ['labels'];

  static type = WorkflowNodeType.InteractiveLabeling;

  label = 'interactive labeling';
}

export class ModelTrainingNode extends DataLabelingWorkflowNode {
  static possibleInputs: string[] = ['labels', 'features', 'model', 'queryUuids'];

  static possibleOutputs: string[] = ['model'];

  static type = WorkflowNodeType.ModelTraining;

  label = 'model training';
}

export class StoppageAnalysisNode extends DataLabelingWorkflowNode {
  static possibleInputs: string[] = ['dataObjects', 'labels', 'model', 'features', 'stop'];

  static possibleOutputs: string[] = ['stop'];

  static type = WorkflowNodeType.StoppageAnalysis;

  label = 'stoppage analysis';
}

export class CustomNode extends DataObjectSelectionNode {
  static type = WorkflowNodeType.Custom;

  label = 'custom';
}

const isOverlapping = (a: Set<unknown>, b: Set<unknown>): boolean => {
  const delta = new Set([...a, ...b]).size - a.size - b.size;
  return delta !== 0;
};

const NODE_TYPES = {
  'initialization node': InitializationNode,
  'decision node': DecisionNode,
  'exit node': ExitNode,
  'data object selection node': DataObjectSelectionNode,
  'default labeling node': DefaultLabelingNode,
  'feature extraction node': FeatureExtractionNode,
  'interactive labeling node': InteractiveLabelingNode,
  'model training node': ModelTrainingNode,
  'stoppage analysis node': StoppageAnalysisNode,
};

export const filterNodeTypesByInputs = (inputs: string[]): string[] => (
  Object.entries(NODE_TYPES).filter(([, type]) => (
    isOverlapping(new Set(inputs), new Set(type.possibleInputs))
  )).map((d) => d[0])
);

export const filterNodeTypesByOutputs = (outputs: string[]): string[] => (
  Object.entries(NODE_TYPES).filter(([, type]) => (
    isOverlapping(new Set(outputs), new Set(type.possibleOutputs))
  )).map((d) => d[0])
);

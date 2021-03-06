// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable max-classes-per-file */
import { IModule, WorkflowNodeType } from '@/commons/types';

type Layout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class WorkflowNode {
  static possibleInputs: string[];

  static possibleOutputs: string[];

  static type: WorkflowNodeType;

  id: string;

  label: string;

  type: WorkflowNodeType;

  value: IModule;

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
    value: IModule,
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

  label = 'conditional branching';
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

export class LabelIdeationNode extends DataLabelingWorkflowNode {
  static possibleInputs: string[] = ['dataObjects', ' model', 'features', 'categories'];

  static possibleOutputs: string[] = ['categories'];

  static type = WorkflowNodeType.LabelIdeation;

  label = 'label ideation';
}

export class QualityAssuranceNode extends DataLabelingWorkflowNode {
  static possibleInputs: string[] = ['dataObjects', 'labels', 'features'];

  static possibleOutputs: string[] = ['labels'];

  static type = WorkflowNodeType.QualityAssurance;

  label = 'quality assurance';
}

export class CustomNode extends DataLabelingWorkflowNode {
  static type = WorkflowNodeType.Base;

  label = 'custom';
}

const isOverlapping = (a: Set<unknown>, b: Set<unknown>): boolean => {
  const delta = new Set([...a, ...b]).size - a.size - b.size;
  return delta !== 0;
};

const NODE_TYPES: { name: string, value: typeof DataLabelingWorkflowNode }[] = [
  { name: 'initialization node', value: InitializationNode },
  { name: 'conditional branching node', value: DecisionNode },
  { name: 'exit node', value: ExitNode },
  { name: 'data object selection node', value: DataObjectSelectionNode },
  { name: 'default labeling node', value: DefaultLabelingNode },
  { name: 'feature extraction node', value: FeatureExtractionNode },
  { name: 'interactive labeling node', value: InteractiveLabelingNode },
  { name: 'model training node', value: ModelTrainingNode },
  { name: 'stoppage analysis node', value: StoppageAnalysisNode },
];

export const filterNodeTypesByInputs = (
  inputs: string[],
): { name: string, value: typeof DataLabelingWorkflowNode }[] => (
  NODE_TYPES.filter(({ value }) => (
    isOverlapping(new Set(inputs), new Set(value.possibleInputs))
  ))
);

export const filterNodeTypesByOutputs = (
  outputs: string[],
): { name: string, value: typeof DataLabelingWorkflowNode }[] => (
  NODE_TYPES.filter(({ value }) => (
    isOverlapping(new Set(outputs), new Set(value.possibleOutputs))
  ))
);

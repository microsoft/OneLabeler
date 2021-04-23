import {
  LabelTaskType,
  Process,
  WorkflowNodeType,
} from '@/commons/types';
import { IState } from './state';

export const labelTasks = (state: IState): LabelTaskType[] => {
  const { nodes } = state;
  const type = WorkflowNodeType.LabelTask;
  const node = nodes.find((d) => d.type === type);
  if (node === undefined) return [];
  return node.value as LabelTaskType[];
};

export const dataObjectSelectionMethod = (
  state: IState,
): Process[] | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.DataObjectSelection;
  const node = nodes.find((d) => d.type === type);
  if (node === undefined) return null;
  return node.value as Process[];
};

export const defaultLabelingMethod = (
  state: IState,
): Process | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.DefaultLabeling;
  const node = nodes.find((d) => d.type === type);
  if (node === undefined) return null;
  return node.value as Process;
};

export const featureExtractionMethod = (
  state: IState,
): Process | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.FeatureExtraction;
  const node = nodes.find((d) => d.type === type);
  if (node === undefined) return null;
  return node.value as Process;
};

export const interactiveLabelingMethod = (
  state: IState,
): Process[] | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.InteractiveLabeling;
  const node = nodes.find((d) => d.type === type);
  if (node === undefined) return null;
  return node.value as Process[];
};

export const interimModelTrainingMethod = (
  state: IState,
): Process | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.InterimModelTraining;
  const node = nodes.find((d) => d.type === type);
  if (node === undefined) return null;
  return node.value as Process;
};

export const stoppageAnalysisMethod = (
  state: IState,
): Process | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.StoppageAnalysis;
  const node = nodes.find((d) => d.type === type);
  if (node === undefined) return null;
  return node.value as Process;
};

export const taskTransformationMethod = (
  state: IState,
): Process | null => {
  const { nodes } = state;
  const type = WorkflowNodeType.TaskTransformation;
  const node = nodes.find((d) => d.type === type);
  if (node === undefined) return null;
  return node.value as Process;
};

import {
  Process,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';

export const isNodeProcess = (node: WorkflowNode): boolean => (
  (node.type === WorkflowNodeType.LabelIdeation)
  || (node.type === WorkflowNodeType.FeatureExtraction)
  || (node.type === WorkflowNodeType.DataObjectSelection)
  || (node.type === WorkflowNodeType.DefaultLabeling)
  || (node.type === WorkflowNodeType.TaskTransformation)
  || (node.type === WorkflowNodeType.InteractiveLabeling)
  || (node.type === WorkflowNodeType.StoppageAnalysis)
  || (node.type === WorkflowNodeType.InterimModelTraining)
  || (node.type === WorkflowNodeType.QualityAssurance)
);

export const isNodeInteractive = (node: WorkflowNode): boolean => {
  if (!isNodeProcess(node)) return false;
  if (node.value === null) return false;
  if (Array.isArray(node.value)) {
    return (node.value as Process[]).find((d) => !d.isAlgorithmic) !== undefined;
  }
  return !(node.value as Process).isAlgorithmic;
};

export const isNodeServerless = (node: WorkflowNode): boolean => {
  if (!isNodeProcess(node)) return true;
  if (node.value === null) return true;
  if (Array.isArray(node.value)) {
    return (node.value as Process[]).find((d) => !d.isServerless) === undefined;
  }
  return (node.value as Process).isServerless;
};

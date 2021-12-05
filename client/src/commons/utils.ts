import { WorkflowNodeType } from '@/commons/types';
import type { Process, WorkflowNode } from '@/commons/types';

export const getImgSize = (
  content: string,
): Promise<{ width: number, height: number }> => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve({ width: img.width, height: img.height });
  img.onerror = (error) => reject(error);
  img.src = content;
});

export const isNodeProcess = (node: WorkflowNode): boolean => (
  (node.type === WorkflowNodeType.LabelIdeation)
  || (node.type === WorkflowNodeType.FeatureExtraction)
  || (node.type === WorkflowNodeType.DataObjectSelection)
  || (node.type === WorkflowNodeType.DefaultLabeling)
  || (node.type === WorkflowNodeType.InteractiveLabeling)
  || (node.type === WorkflowNodeType.StoppageAnalysis)
  || (node.type === WorkflowNodeType.ModelTraining)
  || (node.type === WorkflowNodeType.QualityAssurance)
  || (node.type === WorkflowNodeType.Custom)
);

export const isNodeInteractive = (node: WorkflowNode): boolean => {
  if (!isNodeProcess(node)) return false;
  if (node.value === null) return false;
  return !(node.value as Process).isAlgorithmic;
};

export const isNodeServerless = (node: WorkflowNode): boolean => {
  if (!isNodeProcess(node)) return true;
  if (node.value === null) return true;
  return (node.value as Process).isServerless;
};

export const nodeTypeToColor = (type: WorkflowNodeType): string => {
  if (type === WorkflowNodeType.Initialization) return '#eecfa3';
  if (type === WorkflowNodeType.Decision) return '#ede4a9';
  if (type === WorkflowNodeType.Exit) return '#bccbdd';
  return '#c8e0d9';
  /*
  if (type === WorkflowNodeType.Initialization) return '#ff7f0e';
  if (type === WorkflowNodeType.Decision) return '#17becf';
  if (type === WorkflowNodeType.Exit) return '#1f77b4';
  return '#8c564b';
  */
};

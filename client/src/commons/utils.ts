import { WorkflowNodeType } from '@/commons/types';
import type { IModule, WorkflowNode } from '@/commons/types';

export const getImgSize = (
  content: string,
): Promise<{ width: number, height: number }> => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve({ width: img.width, height: img.height });
  img.onerror = (error) => reject(error);
  img.src = content;
});

export const isNodeModule = (node: WorkflowNode): boolean => (
  node.type !== WorkflowNodeType.Initialization
    && node.type !== WorkflowNodeType.Decision
    && node.type !== WorkflowNodeType.Exit
);

export const isNodeInteractive = (node: WorkflowNode): boolean => {
  if (!isNodeModule(node)) return false;
  if (node.value === null) return false;
  return !(node.value as IModule).isAlgorithmic;
};

export const isNodeServerless = (node: WorkflowNode): boolean => {
  if (!isNodeModule(node)) return true;
  if (node.value === null) return true;
  return (node.value as IModule).isServerless;
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

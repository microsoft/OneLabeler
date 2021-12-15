import type { VueConstructor } from 'vue';
import { WorkflowNodeType } from '@/commons/types';

export const getImgSize = (
  content: string,
): Promise<{ width: number, height: number }> => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve({ width: img.width, height: img.height });
  img.onerror = (error) => reject(error);
  img.src = content;
});

export const isNodeControl = (node: { type: WorkflowNodeType }): boolean => (
  node.type === WorkflowNodeType.Initialization
    || node.type === WorkflowNodeType.Decision
    || node.type === WorkflowNodeType.Exit
);

export const isNodeInteractive = (node: {
  type: WorkflowNodeType,
  value: { render?: () => VueConstructor } | null,
}): boolean => {
  if (isNodeControl(node)) return false;
  if (node.value === null) return false;
  return node.value.render !== undefined;
};

export const isNodeServerless = (node: {
  type: WorkflowNodeType,
  value: { isServerless: boolean } | null,
}): boolean => {
  if (isNodeControl(node)) return true;
  if (node.value === null) return true;
  return node.value.isServerless;
};

export const nodeTypeToColor = (type: WorkflowNodeType): string => {
  if (type === WorkflowNodeType.Initialization) return '#e7a241';
  if (type === WorkflowNodeType.Decision) return '#f6e54c';
  if (type === WorkflowNodeType.Exit) return '#2c9b7c';
  return '#2b579a';
};

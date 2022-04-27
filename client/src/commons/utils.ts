// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WorkflowNode, WorkflowNodeType } from '@/commons/types';

export const getImgSize = (
  content: string,
): Promise<{ width: number, height: number }> => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve({ width: img.width, height: img.height });
  img.onerror = (error) => reject(error);
  img.src = content;
});

export const isNodeControl = (
  node: Pick<WorkflowNode, 'type'>,
): boolean => (
  node.type === WorkflowNodeType.Initialization
    || node.type === WorkflowNodeType.Decision
    || node.type === WorkflowNodeType.Exit
);

export const isNodeInteractive = (
  node: Pick<WorkflowNode, 'type' | 'value'>,
): boolean => {
  if (isNodeControl(node)) return false;
  if (node.value === null) return false;
  return node.value.render !== undefined;
};

export const isNodeServerless = (
  node: Pick<WorkflowNode, 'type' | 'value'>,
): boolean => {
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

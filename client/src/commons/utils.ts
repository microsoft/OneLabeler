import {
  Process,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
 export const isObject = (item: unknown): boolean => (
  item !== null
  && item !== undefined
  && typeof item === 'object'
  && !Array.isArray(item)
);

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export const merge = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        merge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return merge(target, ...sources);
}

export const getImgSize = (content: string) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve({ width: img.width, height: img.height });
  img.onerror = (error) => reject(error);
  img.src = content;
}) as Promise<{ width: number, height: number }>;

export const isNodeProcess = (node: WorkflowNode): boolean => (
  (node.type === WorkflowNodeType.LabelIdeation)
  || (node.type === WorkflowNodeType.FeatureExtraction)
  || (node.type === WorkflowNodeType.DataObjectSelection)
  || (node.type === WorkflowNodeType.DefaultLabeling)
  || (node.type === WorkflowNodeType.InteractiveLabeling)
  || (node.type === WorkflowNodeType.StoppageAnalysis)
  || (node.type === WorkflowNodeType.ModelTraining)
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

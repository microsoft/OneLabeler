import cytoscape from 'cytoscape';
import { WorkflowEdge, WorkflowNode, WorkflowNodeType } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';

const getLoops = (
  node: WorkflowNode,
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
) => {
  const cy = cytoscape({
    elements: {
      nodes: nodes.map((d) => ({ data: { ...d } })),
      edges: edges.map((d) => ({ data: { ...d } })),
    },
    headless: true,
  });
  const outwardEdges = edges.filter((d) => d.source === node.id);
  const nextNodeIds = outwardEdges.map((d) => d.target);
  const idToNode: Record<string, WorkflowNode> = Object
    .fromEntries(nodes.map((d) => [d.id, d]));

  const loops: WorkflowNode[][] = [];
  nextNodeIds.forEach((nodeId) => {
    const { found, path } = cy.elements().aStar({
      root: cy.getElementById(nodeId),
      goal: cy.getElementById(node.id),
      directed: true,
    });
    if (found) {
      const visitedNodes = path.nodes().map((d) => idToNode[d.id()]);
      loops.push(visitedNodes);
    }
  });
  return loops;
};

const containsModelTraining = (nodes: WorkflowNode[]): boolean => (
  nodes.find((d) => d.type === WorkflowNodeType.ModelTraining) !== undefined
);

/** Check that model is iteratively updated. */
const checkIterativeTraining = (
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  // Find modules in loops
  // If a loop has a module that depends on model,
  // the loop is recommended to have a model training module.
  nodes.forEach((node) => {
    if (node.value === null) return;
    const { inputs, outputs } = node.value;
    if (!inputs.includes('model') || outputs.includes('model')) return;
    const loops = getLoops(node, { nodes, edges });
    loops.forEach((loop) => {
      if (containsModelTraining(loop)) return;
      messages.push({
        type: LintMessageType.Warning,
        message: `node with label "${
          node.label
        }" requires model but the model is not iteratively updated in the loop`,
        category: ErrorCategory.AntiPattern,
        subjects: [node],
        rule: 'Models Are Recommended To Be Incrementally Updated',
        fixes: ['consider whether to add model training in the loop that contains this node'],
      });
    });
  });

  return messages;
};

export default checkIterativeTraining;

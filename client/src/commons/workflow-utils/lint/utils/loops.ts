import cytoscape from 'cytoscape';
import type { WorkflowNode, WorkflowEdge } from '@/commons/types';

type Loop = WorkflowNode[];

/**
 * Find loops that contain the given node.
 * Returns the list of loops containing the node.
 */
const getLoops = (
  node: WorkflowNode,
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): Loop[] => {
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

  const loops: Loop[] = [];
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

export default getLoops;

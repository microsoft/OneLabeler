import cytoscape from 'cytoscape';
import type { WorkflowNode, WorkflowEdge } from '@/commons/types';

/**
 * Breadth first search the graph from the root.
 * Returns the list of visited nodes in the visiting order.
 */
const bfs = (
  root: WorkflowNode,
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): WorkflowNode[] => {
  // Implementation note:
  // cytoscape raises error when the edge's
  // source/target is not an existing node's id,
  // thus needs to remove these invalid edges.
  const nodeIds: Set<string> = new Set(nodes.map((d) => d.id));
  const edgesFiltered = edges.filter(({ source, target }) => (
    nodeIds.has(source) && nodeIds.has(target)
  ));

  // Implementation note:
  // cytoscape adds id to the input nodes and edges
  // if id doesn't exist yet,
  // thus need to send deep copies to avoid cytoscape
  // changing the input graph.
  const cy = cytoscape({
    elements: {
      nodes: nodes.map((d) => ({ data: { ...d } })),
      edges: edgesFiltered.map((d) => ({ data: { ...d } })),
    },
    headless: true,
  });

  const visitedNodes = cy.elements().bfs({
    roots: cy.getElementById(root.id),
    directed: true,
  }).path.nodes();

  const idToNode: Record<string, WorkflowNode> = Object
    .fromEntries(nodes.map((d) => [d.id, d]));
  return visitedNodes.map((d) => idToNode[d.id()]);
};

export default bfs;

import cytoscape from 'cytoscape';
import type { WorkflowNode, WorkflowEdge } from '@/commons/types';

/**
 * A* search the graph from the root to the goal.
 * Returns the list of visited nodes in the visiting order.
 * If no path exists between root and goal, return null.
 */
const aStar = (
  root: WorkflowNode,
  goal: WorkflowNode,
  edgeWeights: number[],
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): WorkflowNode[] | null => {
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
      edges: edgesFiltered.map((d, i) => (
        { data: { ...d, weight: edgeWeights[i] } }
      )),
    },
    headless: true,
  });

  const { found, path } = cy.elements().aStar({
    root: cy.getElementById(root.id),
    goal: cy.getElementById(goal.id),
    weight: (d) => d.data('weight'),
    directed: true,
  });

  if (!found) return null;

  const visitedNodes = path.nodes();
  const idToNode: Record<string, WorkflowNode> = Object
    .fromEntries(nodes.map((d) => [d.id, d]));
  return visitedNodes.map((d) => idToNode[d.id()]);
};

export default aStar;

import cytoscape from 'cytoscape';
import type { WorkflowNode, WorkflowEdge } from '@/commons/types';

type Path = WorkflowNode[];

/**
 * Get different paths from the root node to the goal node with no loop.
 * @note
 * The implementation cannot guarantee all the paths are returned.
 * For example, for graph
 * a -> b1
 * a -> b2
 * b2 -> c
 * b1 -> c
 * c -> d1
 * c -> d2
 * d1 -> e
 * d2 -> e
 * there are four different paths from a to e:
 * 1. a, b1, c, d1, e
 * 2. a, b1, c, d2, e
 * 3. a, b2, c, d1, e
 * 4. a, b2, c, d2, e
 * while the current implementation would only generate two or three of them
 * depending on the randomization in cytoscape.
 */
const getPaths = (
  root: WorkflowNode,
  goal: WorkflowNode,
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): Path[] => {
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

  const idToNode: Record<string, WorkflowNode> = Object
    .fromEntries(nodes.map((d) => [d.id, d]));
  const paths: Path[] = [];
  const visitedNodeIds: Set<string> = new Set([]);
  nodes.forEach((node): void => {
    if (visitedNodeIds.has(node.id)) return;
    const { found: foundFromStart, path: pathFromStart } = cy.elements().aStar({
      root: cy.getElementById(root.id),
      goal: cy.getElementById(node.id),
      directed: true,
    });
    const { found: foundToEnd, path: pathToEnd } = cy.elements().aStar({
      root: cy.getElementById(node.id),
      goal: cy.getElementById(goal.id),
      directed: true,
    });

    if (!foundFromStart || !foundToEnd) return;
    const path = [
      ...pathFromStart.nodes().map((d) => idToNode[d.id()]),
      ...pathToEnd.nodes().map((d) => idToNode[d.id()]).slice(1),
    ];
    paths.push(path);
    path.forEach((d) => visitedNodeIds.add(d.id));
  });

  return paths;
};

export default getPaths;

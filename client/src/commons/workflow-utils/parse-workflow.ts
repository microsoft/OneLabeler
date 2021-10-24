import { WorkflowGraph } from '@/commons/types';
import type { TrimmedNode } from './parse-node';
import { parseNode } from './parse-node';
import type { TrimmedEdge } from './parse-edge';
import { parseEdge } from './parse-edge';

export type TrimmedWorkflow = {
  nodes: TrimmedNode[];
  edges: TrimmedEdge[];
  label?: string;
}

/** Parse trimmed serializable workflow. */
export const parseWorkflow = (
  graph: TrimmedWorkflow,
): WorkflowGraph => {
  const nodes = graph.nodes.map((node, i) => parseNode(node, i));
  const edges = graph.edges.map((edge) => parseEdge(edge, nodes));
  const { label } = graph;
  return { nodes, edges, label };
};

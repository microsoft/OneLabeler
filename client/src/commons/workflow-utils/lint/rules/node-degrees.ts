import { WorkflowEdge, WorkflowNodeType } from '@/commons/types';
import type { WorkflowNode } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';

/**
 * Check all the nodes have valid indegrees and outdegrees.
 * 1. an initialization node has indegree 0 and outdegree 1
 * 2. a decision node has >= 1 indegree and outdegree 2
 * 3. an exist node has >= 1 indegree and outdegree 0
 * 4. a process node has >= 1 indegree and outdegree 1
 */
const checkNodeDegrees = (
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  const outdegrees: Record<string, number> = Object
    .fromEntries(nodes.map((d) => [d.id, 0]));
  const indegrees: Record<string, number> = Object
    .fromEntries(nodes.map((d) => [d.id, 0]));

  edges.forEach(({ source, target }) => {
    if (!(source in outdegrees) || !(target in indegrees)) return;

    outdegrees[source] += 1;
    indegrees[target] += 1;
  });

  nodes.forEach((node) => {
    const { id, type } = node;
    if (!(id in outdegrees) || !(id in indegrees)) return;

    const indegree = indegrees[id];
    const outdegree = outdegrees[id];

    if (type === WorkflowNodeType.Initialization) {
      // - an initialization node has indegree 0 and outdegree 1

      if (indegree !== 0) {
        const inwardEdges = edges.filter((d) => d.target === id);
        messages.push({
          type: LintMessageType.Error,
          message: `initialization node with label "${
            node.label
          }" has indegree ${indegree}`,
          category: ErrorCategory.TopologyError,
          subjects: [node, ...inwardEdges],
          rule: 'flowchart-node-indegree-range',
          fixes: ['remove all the inward edges to the initialization node to make its indegree zero'],
        });
      }
      if (outdegree !== 1) {
        const outwardEdges = edges.filter((d) => d.source === id);
        messages.push({
          type: LintMessageType.Error,
          message: `initialization node with label "${
            node.label
          }" has outdegree ${outdegree}`,
          category: ErrorCategory.TopologyError,
          subjects: [node, ...outwardEdges],
          rule: 'flowchart-node-outdegree-range',
          fixes: [
            `${outdegree === 0 ? 'create an outward edge' : 'remove outward edges'}
            from the initialization node to make its outdegree one`,
          ],
        });
      }
    } else if (type === WorkflowNodeType.Decision) {
      // - a decision node has >= 1 indegree and outdegree 2

      if (indegree === 0) {
        messages.push({
          type: LintMessageType.Error,
          message: `conditional branching node with label "${
            node.label
          }" has indegree 0`,
          category: ErrorCategory.TopologyError,
          subjects: [node],
          rule: 'flowchart-node-indegree-range',
          fixes: ['create an inward edge to the conditional branching node to make its indegree nonzero'],
        });
      }

      const outwardEdges = edges.filter((d) => d.source === id);
      if (outdegree !== 2) {
        messages.push({
          type: LintMessageType.Error,
          message: `conditional branching node with label "${
            node.label
          }" has outdegree ${outdegree}`,
          category: ErrorCategory.TopologyError,
          subjects: [node, ...outwardEdges],
          rule: 'flowchart-node-outdegree-range',
          fixes: [
            `${outdegree <= 1 ? 'create an outward edge' : 'remove outward edges'}
            from the conditional branching node to make its outdegree two`,
          ],
        });
      } else {
        outwardEdges.forEach((edge) => {
          if (edge.condition !== undefined) return;
          messages.push({
            type: LintMessageType.Error,
            message: `outward edge from conditional branching node with label "${
              node.label
            }" to node with label "${edge.target}" has no condition`,
            category: ErrorCategory.TopologyError,
            subjects: [edge],
            rule: 'should-choose-branching-condition',
            fixes: ['choose a branching condition for this edge'],
          });
        });
        const [edge1, edge2] = outwardEdges;
        if (edge1.condition !== !edge2.condition) {
          messages.push({
            type: LintMessageType.Error,
            message: `conditions of outward edges of conditional branching node with label "${
              node.label
            }" are all ${edge1.condition}`,
            category: ErrorCategory.TopologyError,
            subjects: [edge1, edge2],
            rule: 'no-repeated-branching-condition',
            fixes: ['flip the branching condition of one of the two edges'],
          });
        }
      }
    } else if (type === WorkflowNodeType.Exit) {
      // - an exist node has >= 1 indegree and outdegree 0

      if (indegree === 0) {
        messages.push({
          type: LintMessageType.Error,
          message: `exit node with label "${node.label}" has indegree 0`,
          category: ErrorCategory.TopologyError,
          subjects: [node],
          rule: 'flowchart-node-indegree-range',
          fixes: ['create an inward edge to the exit node to make its indegree nonzero'],
        });
      }
      if (outdegree !== 0) {
        const outwardEdges = edges.filter((d) => d.source === id);
        messages.push({
          type: LintMessageType.Error,
          message: `exit node with label "${node.label}" has outdegree ${outdegree}`,
          category: ErrorCategory.TopologyError,
          subjects: [node, ...outwardEdges],
          rule: 'flowchart-node-outdegree-range',
          fixes: ['remove outward edges from the exit node to make its outdegree zero'],
        });
      }
    } else {
      // - a process node has >= 1 indegree and outdegree 1

      if (indegree === 0) {
        messages.push({
          type: LintMessageType.Error,
          message: `computation node with label "${node.label}" has indegree 0`,
          category: ErrorCategory.TopologyError,
          subjects: [node],
          rule: 'flowchart-node-indegree-range',
          fixes: [`create an inward edge to the node with label "${node.label}" to make its indegree nonzero`],
        });
      }
      if (outdegree !== 1) {
        const outwardEdges = edges.filter((d) => d.source === id);
        messages.push({
          type: LintMessageType.Error,
          message: `computation node with label "${node.label}" has outdegree ${outdegree}`,
          category: ErrorCategory.TopologyError,
          subjects: [node, ...outwardEdges],
          rule: 'flowchart-node-outdegree-range',
          fixes: [
            `${outdegree === 0 ? 'create an outward edge' : 'remove outward edges'}
            from the node with label "${node.label}" to make its outdegree one`,
          ],
        });
      }
    }
  });

  return messages;
};

export default checkNodeDegrees;

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
          rule: 'Initialize Node Indegree Should Be Zero',
          fixes: ['remove all the inward edges to the initialization node'],
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
          rule: 'Initialize Node Outdegree Should Be One',
          fixes: [
            outdegree === 0
              ? 'create an outward edge from the initialization node to another node'
              : 'remove an outward edge from the initialization node',
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
          rule: 'Decision Node Indegree Should Not Be Zero',
          fixes: ['create an inward edge from another node to the conditional branching node'],
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
          rule: 'Decision Node Outdegree Should Be Two',
          fixes: [
            outdegree <= 1
              ? 'create an outward edge from the conditional branching node to another node'
              : 'remove an outward edge from the conditional branching node',
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
            rule: 'Decision Node Outward Edge Should Have Condition',
            fixes: ['remove this edge'],
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
            rule: 'Decision Node Outward Edge Conditions Should Be Exclusive',
            fixes: ['remove one of the two edges'],
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
          rule: 'Exit Node Indegree Should Not Be Zero',
          fixes: ['create an inward edge from another node to the exit node'],
        });
      }
      if (outdegree !== 0) {
        const outwardEdges = edges.filter((d) => d.source === id);
        messages.push({
          type: LintMessageType.Error,
          message: `exit node with label "${node.label}" has outdegree ${outdegree}`,
          category: ErrorCategory.TopologyError,
          subjects: [node, ...outwardEdges],
          rule: 'Exit Node Outdegree Should Be Zero',
          fixes: ['remove outward edges from the exit node'],
        });
      }
    } else {
      // - a process node has >= 1 indegree and outdegree 1

      if (indegree === 0) {
        messages.push({
          type: LintMessageType.Error,
          message: `process node with label "${node.label}" has indegree 0`,
          category: ErrorCategory.TopologyError,
          subjects: [node],
          rule: 'Module Node Indegree Should Not Be Zero',
          fixes: [`create an inward edge from another node to the node with label "${node.label}"`],
        });
      }
      if (outdegree !== 1) {
        const outwardEdges = edges.filter((d) => d.source === id);
        messages.push({
          type: LintMessageType.Error,
          message: `process node with label "${node.label}" has outdegree ${outdegree}`,
          category: ErrorCategory.TopologyError,
          subjects: [node, ...outwardEdges],
          rule: 'Module Node Outdegree Should Be One',
          fixes: [
            outdegree === 0
              ? `create an outward edge from the node with label "${node.label}" to another node`
              : `remove an outward edge from the node with label "${node.label}"`,
          ],
        });
      }
    }
  });

  return messages;
};

export default checkNodeDegrees;

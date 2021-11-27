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
          subjects: [node, ...inwardEdges],
          message: `initialization node with label "${
            node.label
          }" has indegree ${indegree} (Initialize Node Indegree Should Be Zero)`,
          type: LintMessageType.Error,
          category: ErrorCategory.TopologyError,
        });
      }
      if (outdegree !== 1) {
        const outwardEdges = edges.filter((d) => d.source === id);
        messages.push({
          subjects: [node, ...outwardEdges],
          message: `initialization node with label "${
            node.label
          }" has outdegree ${outdegree} (Initialize Node Outdegree Should Be One)`,
          type: LintMessageType.Error,
          category: ErrorCategory.TopologyError,
        });
      }
    } else if (type === WorkflowNodeType.Decision) {
      // - a decision node has >= 1 indegree and outdegree 2

      if (indegree === 0) {
        messages.push({
          subjects: [node],
          message: `decision node with label "${
            node.label
          }" has indegree 0 (Decision Node Indegree Should Not Be Zero)`,
          type: LintMessageType.Error,
          category: ErrorCategory.TopologyError,
        });
      }
      if (outdegree !== 2) {
        const outwardEdges = edges.filter((d) => d.source === id);
        messages.push({
          subjects: [node, ...outwardEdges],
          message: `decision node with label "${
            node.label
          }" has outdegree ${outdegree} (Decision Node Outdegree Should Be Two)`,
          type: LintMessageType.Error,
          category: ErrorCategory.TopologyError,
        });
      }
    } else if (type === WorkflowNodeType.Exit) {
      // - an exist node has >= 1 indegree and outdegree 0

      if (indegree === 0) {
        messages.push({
          subjects: [node],
          message: `exit node with label "${
            node.label
          }" has indegree 0 (Exit Node Indegree Should Not Be Zero)`,
          type: LintMessageType.Error,
          category: ErrorCategory.TopologyError,
        });
      }
      if (outdegree !== 0) {
        const outwardEdges = edges.filter((d) => d.source === id);
        messages.push({
          subjects: [node, ...outwardEdges],
          message: `exit node with label "${
            node.label
          }" has outdegree ${outdegree} (Exit Node Outdegree Should Be Zero)`,
          type: LintMessageType.Error,
          category: ErrorCategory.TopologyError,
        });
      }
    } else {
      // - a process node has >= 1 indegree and outdegree 1

      if (indegree === 0) {
        messages.push({
          subjects: [node],
          message: `process node with label "${
            node.label
          }" has indegree 0 (Process Node Indegree Should Not Be Zero)`,
          type: LintMessageType.Error,
          category: ErrorCategory.TopologyError,
        });
      }
      if (outdegree !== 1) {
        const outwardEdges = edges.filter((d) => d.source === id);
        messages.push({
          subjects: [node, ...outwardEdges],
          message: `process node with label "${
            node.label
          }" has outdegree ${outdegree} (Process Node Outdegree Should Be One)`,
          type: LintMessageType.Error,
          category: ErrorCategory.TopologyError,
        });
      }
    }
  });

  return messages;
};

export default checkNodeDegrees;

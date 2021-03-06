// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WorkflowEdge, WorkflowNode, WorkflowNodeType } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';
import bfs from '../utils/bfs';

/** Check all the nodes can be reached from the initialization node. */
const checkNodeReachesExit = (
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  // Only one exit node should exist.
  const exitNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Exit
  ));
  if (exitNodes.length !== 1) return [];
  const [exitNode] = exitNodes;

  const invertedEdges = edges.map((d) => (
    {
      ...d,
      source: d.target,
      target: d.source,
    }
  ));
  const visitedNodes = bfs(exitNode, { nodes, edges: invertedEdges });
  const allNodesVisited = visitedNodes.length === nodes.length;
  if (!allNodesVisited) {
    const visitedNodeIds = new Set(visitedNodes.map((d) => d.id));
    const unreachableNodes = nodes.filter((d) => !visitedNodeIds.has(d.id));
    unreachableNodes.forEach((node) => {
      messages.push({
        type: LintMessageType.Error,
        message: `node with label "${node.label}" cannot reach the exit node`,
        category: ErrorCategory.TopologyError,
        subjects: [node],
        rule: 'no-dead-end-node',
        fixes: [`create an outward edge from the node with label "${
          node.label
        }" to another node that can reach the exit node`],
      });
    });
  }

  return messages;
};

export default checkNodeReachesExit;

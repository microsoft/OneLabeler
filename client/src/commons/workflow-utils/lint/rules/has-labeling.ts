import { WorkflowEdge, WorkflowNode, WorkflowNodeType } from '@/commons/types';
import { ErrorCategory, LintMessageType } from '../types';
import type { LintMessage } from '../types';
import aStar from '../utils/a-star';

/** Check that interactive labeling is used. */
const checkHasLabeling = (
  { nodes, edges }: { nodes: WorkflowNode[], edges: WorkflowEdge[] },
): LintMessage[] => {
  const messages: LintMessage[] = [];

  // Exist at least one interactive labeling node.
  const existInteractiveLabelingNode = nodes.findIndex((d) => (
    d.type === WorkflowNodeType.InteractiveLabeling
  )) >= 0;
  if (!existInteractiveLabelingNode) {
    return [{
      type: LintMessageType.Error,
      message: 'no interactive labeling node exists',
      subjects: [],
      category: ErrorCategory.TopologyError,
      rule: 'Should Involve Labeling',
      fixes: ['create an interactive labeling node'],
    }];
  }

  // Should have one initialization node and one exit node
  const initializationNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Initialization
  ));
  if (initializationNodes.length !== 1) return messages;
  const [initializationNode] = initializationNodes;
  const exitNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Exit
  ));
  if (exitNodes.length !== 1) return messages;
  const [exitNode] = exitNodes;

  // For all paths from the initialization node to the exit node,
  // interactive labeling node(s) is visited at least once.

  // Set the weight of inward edge to interactive labeling node(s) to 1
  // and the weight of other edges to 0.
  // In this case, if the shortest path from start to end still visits
  // an interactive labeling node, then it implies there is no way
  // to walk around the interactive labeling node(s).
  const idToNode: Record<string, WorkflowNode> = Object
    .fromEntries(nodes.map((d) => [d.id, d]));
  const edgeWeights = edges.map(({ target }) => {
    const targetNode = idToNode[target];
    return targetNode?.type === WorkflowNodeType.InteractiveLabeling ? 1 : 0;
  });
  const visitedNodes = aStar(
    initializationNode,
    exitNode,
    edgeWeights,
    { nodes, edges },
  );
  if (visitedNodes === null) return messages;

  const involveLabeling = visitedNodes.find((node) => (
    node.type === WorkflowNodeType.InteractiveLabeling
  )) !== undefined;
  if (!involveLabeling) {
    messages.push({
      type: LintMessageType.Error,
      message: 'exist an execution of the workflow that does not involve labeling',
      category: ErrorCategory.TopologyError,
      subjects: [],
      rule: 'Should Involve Labeling',
      fixes: [],
    });
  }

  return messages;
};

export default checkHasLabeling;

import cytoscape from 'cytoscape';
import {
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeType,
} from './types';

interface Notification {
  subject: WorkflowNode | WorkflowEdge | null;
  message: string,
  type: 'Error' | 'Warning',
}

// Grammatical Checking: Check whether the graph is valid.
export const validateWorkflow = (graph: {
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
}): Notification[] => {
  const { nodes, edges } = graph;

  const cy = cytoscape({
    elements: {
      nodes: nodes.map((d) => ({ data: d })),
      edges: edges.map((d) => ({ data: d })),
    },
  });

  const notifications = [] as Notification[];

  // 0. basic data structure constraint
  // 0.1. all the nodes have unique id
  nodes.forEach((node) => {
    const { id } = node;
    const matchedNode = nodes.filter((d) => d.id === id);
    if (matchedNode.length !== 1) {
      notifications.push({
        subject: node,
        message: `Data Structure Error: node id (id = ${node.id}) not unique`,
        type: 'Error',
      });
    }
  });

  // 0.2. all the edges points to existing nodes
  edges.forEach((edge) => {
    const { source, target } = edge;
    const matchedSource = nodes.filter((d) => d.id === source);
    if (matchedSource.length !== 1) {
      notifications.push({
        subject: edge,
        message: `Data Structure Error: edge source (id = ${source}) not an existing node`,
        type: 'Error',
      });
    }
    const matchedTarget = nodes.filter((d) => d.id === target);
    if (matchedTarget.length !== 1) {
      notifications.push({
        subject: edge,
        message: `Data Structure Error: edge target (id = ${target}) not an existing node`,
        type: 'Error',
      });
    }
  });

  // 1. node existential constraints
  // 1.1. one initialization node
  const initializationNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Initialization
  ));
  if (initializationNodes.length !== 1) {
    notifications.push({
      subject: null,
      message: 'Grammar Error: exactly one initialization node is needed',
      type: 'Error',
    });
  }

  // 1.2. one exit node
  const exitNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Terminal
  ));
  if (exitNodes.length !== 1) {
    notifications.push({
      subject: null,
      message: 'Grammar Error: exactly one exit node is needed',
      type: 'Error',
    });
  }

  // 1.3. at least one interactive labeling node
  const existInteractiveLabelingNode = nodes.findIndex((d) => (
    d.type === WorkflowNodeType.InteractiveLabeling
  )) >= 0;
  if (!existInteractiveLabelingNode) {
    notifications.push({
      subject: null,
      message: 'Grammar Error: no interactive labeling node',
      type: 'Error',
    });
  }

  // 2. graph connectivity constraint
  // - all the nodes should be reachable from the initialization node
  const [initializationNode] = initializationNodes;
  const visitedNodes = cy.elements().bfs({
    roots: cy.getElementById(initializationNode.id),
    directed: true,
  }).path.nodes();
  const allNodesVisited = visitedNodes.length === nodes.length;
  if (!allNodesVisited) {
    notifications.push({
      subject: null,
      message: 'Grammar Error: not all the nodes reachable',
      type: 'Error',
    });
  }

  // 3. node linkage constraints
  // 3.1. an initialization node has indegree 0 and outdegree 1
  // 3.2. a decision node has arbitrary indegree and outdegree 2
  // 3.3. an exist node has arbitrary indegree and outdegree 0
  // 3.4. a process node has arbitrary indegree and outdegree 1
  nodes.forEach((node) => {
    const { id, type } = node;
    const indegree = cy.getElementById(id).indegree(true);
    const outdegree = cy.getElementById(id).outdegree(true);
    if (type === WorkflowNodeType.Initialization) {
      if (indegree !== 0) {
        notifications.push({
          subject: node,
          message: `Grammar Error: initialization node (id = ${node.id}) indegree != 1`,
          type: 'Error',
        });
      }
      if (outdegree !== 1) {
        notifications.push({
          subject: node,
          message: `Grammar Error: initialization node (id = ${node.id}) outdegree != 1`,
          type: 'Error',
        });
      }
    } else if (type === WorkflowNodeType.Decision) {
      if (outdegree !== 2) {
        notifications.push({
          subject: node,
          message: `Grammar Error: decision node (id = ${node.id}) outdegree != 2`,
          type: 'Error',
        });
      }
    } else if (type === WorkflowNodeType.Terminal) {
      if (outdegree !== 0) {
        notifications.push({
          subject: node,
          message: `Grammar Error: exit node (id = ${node.id}) outdegree != 0`,
          type: 'Error',
        });
      }
    } else if (outdegree !== 1) {
      notifications.push({
        subject: node,
        message: `Grammar Error: process node (id = ${node.id}) outdegree != 1`,
        type: 'Error',
      });
    }
  });

  // 3.5. non of the nodes have self loop
  edges.forEach((edge) => {
    const { source, target } = edge;
    if (source === target) {
      const node = nodes.find((d) => d.id === source) as WorkflowNode;
      notifications.push({
        subject: node,
        message: `Grammar Error: node (id = ${node.id}) has self loop`,
        type: 'Error',
      });
    }
  });

  // 4. state initialization constraint
  // - a process node cannot be executed before its input
  // parameters are all initialized by the previous processes
  // TODO

  // 5. avoid repetitive computation constraint
  // - a process node cannot be executed again until at least
  // one of its input parameters has been changed
  // TODO

  return notifications;
};

// Content Checking: Check whether the process instantiations are valid.
export const validateInstantiations = (graph: {
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
}): Notification[] => {
  const { nodes, edges } = graph;
  const notifications = [] as Notification[];

  // Strict constraints:
  // 1. Data Type and Label Task must be chosen
  const initializationNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Initialization
  ));
  if (initializationNodes.length === 1) {
    const [initializationNode] = initializationNodes;
    const isDataTypeValid = initializationNode.value !== undefined
      && initializationNode.value !== null
      && 'dataType' in initializationNode.value;
    if (!isDataTypeValid) {
      notifications.push({
        subject: initializationNode,
        message: 'Value Error: data type not selected',
        type: 'Error',
      });
    }
    const isLabelTasksValid = initializationNode.value !== undefined
      && initializationNode.value !== null
      && 'labelTasks' in initializationNode.value
      && Array.isArray(initializationNode.value.labelTasks)
      && initializationNode.value.labelTasks.length !== 0;
    if (!isLabelTasksValid) {
      notifications.push({
        subject: initializationNode,
        message: 'Value Error: label task(s) not selected',
        type: 'Error',
      });
    }
  }

  // 2. All the processes in the graph must have at least one instantiation chosen
  nodes.forEach((node) => {
    if (node.type === WorkflowNodeType.Initialization) return;
    const hasSingleInstance = !Array.isArray(node.value)
      && node.value !== undefined
      && node.value !== null;
    const hasMultipleInstances = Array.isArray(node.value)
      && node.value.length !== 0;
    if (!hasSingleInstance && !hasMultipleInstances) {
      notifications.push({
        subject: node,
        message: `Value Error: process (id = ${node.id}) instantiation(s) need to be selected`,
        type: 'Error',
      });
    }
  });

  // Recommendations:
  // 1. For Object Detection and Segmentation Tasks,
  // Single Object Display should be enabled
  // TODO

  return notifications;
};

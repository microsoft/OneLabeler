import cytoscape from 'cytoscape';
import {
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeType,
} from './types';

export interface Notification {
  subject: WorkflowNode | WorkflowEdge | null;
  message: string;
  type: 'Error' | 'Warning' | 'Success';
  category?: 'Data Structure Error' | 'Grammar Error' | 'Value Error';
}

// Grammatical Checking: Check whether the graph is valid.
export const validateWorkflow = (graph: {
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
}): Notification[] => {
  const { nodes, edges } = graph;

  const notifications = [] as Notification[];

  // 0. basic data structure constraint
  // 0.1. all the nodes have unique id
  nodes.forEach((node) => {
    const { id } = node;
    const matchedNode = nodes.filter((d) => d.id === id);
    if (matchedNode.length !== 1) {
      notifications.push({
        subject: node,
        message: `node id (name = ${node.title}) not unique`,
        type: 'Error',
        category: 'Data Structure Error',
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
        message: `edge source (id = ${source}) not an existing node`,
        type: 'Error',
        category: 'Data Structure Error',
      });
    }
    const matchedTarget = nodes.filter((d) => d.id === target);
    if (matchedTarget.length !== 1) {
      notifications.push({
        subject: edge,
        message: `edge target (id = ${target}) not an existing node`,
        type: 'Error',
        category: 'Data Structure Error',
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
      message: 'exactly one initialization node is needed',
      type: 'Error',
      category: 'Grammar Error',
    });
  }

  // 1.2. one exit node
  const exitNodes = nodes.filter((d) => (
    d.type === WorkflowNodeType.Terminal
  ));
  if (exitNodes.length !== 1) {
    notifications.push({
      subject: null,
      message: 'exactly one exit node is needed',
      type: 'Error',
      category: 'Grammar Error',
    });
  }

  // 1.3. at least one interactive labeling node
  const existInteractiveLabelingNode = nodes.findIndex((d) => (
    d.type === WorkflowNodeType.InteractiveLabeling
  )) >= 0;
  if (!existInteractiveLabelingNode) {
    notifications.push({
      subject: null,
      message: 'no interactive labeling node',
      type: 'Error',
      category: 'Grammar Error',
    });
  }

  // note:
  // 1. cytoscape adds id to the input nodes and edges
  // if id doesn't exist yet,
  // thus need to send deep copies to avoid cytoscape
  // changing the input graph.
  // 2. cytoscape raises error when the edge's
  // source/target is not an existing node's id,
  // thus needs to remove these invalid edges.
  const edgesFiltered = edges.filter(({ source, target }) => {
    const matchedSource = nodes.filter((d) => d.id === source);
    if (matchedSource.length !== 1) return false;
    const matchedTarget = nodes.filter((d) => d.id === target);
    if (matchedTarget.length !== 1) return false;
    return true;
  });
  const cy = cytoscape({
    elements: {
      nodes: nodes.map((d) => ({ data: { ...d } })),
      edges: edgesFiltered.map((d) => ({ data: { ...d } })),
    },
    headless: true,
  });

  // 2. graph connectivity constraint
  // - all the nodes should be reachable from the initialization node
  if (initializationNodes.length === 1) {
    const [initializationNode] = initializationNodes;
    const visitedNodes = cy.elements().bfs({
      roots: cy.getElementById(initializationNode.id),
      directed: true,
    }).path.nodes();
    const allNodesVisited = visitedNodes.length === nodes.length;
    if (!allNodesVisited) {
      notifications.push({
        subject: null,
        message: 'not all the nodes reachable',
        type: 'Error',
        category: 'Grammar Error',
      });
    }
  }

  // 3. node linkage constraints
  // 3.1. an initialization node has indegree 0 and outdegree 1
  // 3.2. a decision node has >= 1 indegree and outdegree 2
  // 3.3. an exist node has >= 1 indegree and outdegree 0
  // 3.4. a process node has >= 1 indegree and outdegree 1
  nodes.forEach((node) => {
    const { id, type } = node;
    const indegree = cy.getElementById(id).indegree(true);
    const outdegree = cy.getElementById(id).outdegree(true);
    if (type === WorkflowNodeType.Initialization) {
      if (indegree !== 0) {
        notifications.push({
          subject: node,
          message: `initialization node (name = ${node.title}) indegree != 1`,
          type: 'Error',
          category: 'Grammar Error',
        });
      }
      if (outdegree !== 1) {
        notifications.push({
          subject: node,
          message: `initialization node (name = ${node.title}) outdegree != 1`,
          type: 'Error',
          category: 'Grammar Error',
        });
      }
    } else if (type === WorkflowNodeType.Decision) {
      if (indegree === 0) {
        notifications.push({
          subject: node,
          message: `decision node (name = ${node.title}) indegree = 0`,
          type: 'Error',
          category: 'Grammar Error',
        });
      }
      if (outdegree !== 2) {
        notifications.push({
          subject: node,
          message: `decision node (name = ${node.title}) outdegree != 2`,
          type: 'Error',
          category: 'Grammar Error',
        });
      }
    } else if (type === WorkflowNodeType.Terminal) {
      if (indegree === 0) {
        notifications.push({
          subject: node,
          message: `exit node (name = ${node.title}) indegree = 0`,
          type: 'Error',
          category: 'Grammar Error',
        });
      }
      if (outdegree !== 0) {
        notifications.push({
          subject: node,
          message: `exit node (name = ${node.title}) outdegree != 0`,
          type: 'Error',
          category: 'Grammar Error',
        });
      }
    } else {
      if (indegree === 0) {
        notifications.push({
          subject: node,
          message: `process node (name = ${node.title}) indegree = 0`,
          type: 'Error',
          category: 'Grammar Error',
        });
      }
      if (outdegree !== 1) {
        notifications.push({
          subject: node,
          message: `process node (name = ${node.title}) outdegree != 1`,
          type: 'Error',
          category: 'Grammar Error',
        });
      }
    }
  });

  // 3.5. non of the nodes have self loop
  edges.forEach((edge) => {
    const { source, target } = edge;
    if (source === target) {
      const node = nodes.find((d) => d.id === source) as WorkflowNode;
      notifications.push({
        subject: node,
        message: `node (name = ${node.title}) has self loop`,
        type: 'Error',
        category: 'Grammar Error',
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
        message: 'data type not selected',
        type: 'Error',
        category: 'Value Error',
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
        message: 'label task(s) not selected',
        type: 'Error',
        category: 'Value Error',
      });
    }
  }

  // 2. All the processes in the graph must have at least one instantiation chosen
  nodes.forEach((node) => {
    if (node.type === WorkflowNodeType.Initialization) return;
    if (node.type === WorkflowNodeType.Decision) return;
    if (node.type === WorkflowNodeType.Terminal) return;
    const hasSingleInstance = !Array.isArray(node.value)
      && node.value !== undefined
      && node.value !== null;
    const hasMultipleInstances = Array.isArray(node.value)
      && node.value.length !== 0;
    if (!hasSingleInstance && !hasMultipleInstances) {
      notifications.push({
        subject: node,
        message: `process (name = ${node.title}) instantiation(s) not selected`,
        type: 'Error',
        category: 'Value Error',
      });
    }
  });

  // Recommendations:
  // 1. For Object Detection and Segmentation Tasks,
  // Single Object Display should be enabled
  // TODO

  return notifications;
};

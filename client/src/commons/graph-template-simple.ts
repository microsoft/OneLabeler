import {
  Process,
  ProcessType,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeType,
} from './types';

export default {
  nodes: [
    {
      id: 'node-47353599',
      title: 'initialization',
      type: WorkflowNodeType.Initialization,
      value: {
        dataType: null,
        labelTasks: [],
      },
      x: 25,
      y: 25,
    },
    {
      id: 'node-6411710',
      title: 'data object selection',
      type: WorkflowNodeType.DataObjectSelection,
      value: [],
      x: 145,
      y: 25,
    },
    {
      id: 'node-63746075',
      title: 'task transform',
      type: WorkflowNodeType.TaskTransformation,
      value: new Process({
        type: ProcessType.TaskTransformation,
        name: 'DirectLabeling',
        id: 'DirectLabeling-97377357',
        inputs: ['dataObjects', 'labelTask', 'labelSpace'],
        isAlgorithmic: true,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: true,
      }),
      x: 265,
      y: 25,
    },
    {
      id: 'node-44216216',
      title: 'interactive labeling',
      type: WorkflowNodeType.InteractiveLabeling,
      value: [],
      x: 385,
      y: 25,
    },
    {
      id: 'node-70767097',
      title: 'stoppage analysis',
      type: WorkflowNodeType.StoppageAnalysis,
      value: new Process({
        type: ProcessType.StoppageAnalysis,
        name: 'AllChecked',
        id: 'AllChecked-46322013',
        inputs: ['labels'],
        isAlgorithmic: true,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: true,
        api: 'AllChecked',
      }),
      x: 505,
      y: 25,
    },
    {
      id: 'node-69466632',
      title: 'stop?',
      type: WorkflowNodeType.Decision,
      x: 505,
      y: 115,
    },
    {
      id: 'node-29117539',
      title: 'exit',
      type: WorkflowNodeType.Terminal,
      x: 505,
      y: 205,
    },
  ],
  edges: [
    {
      source: 'node-47353599',
      target: 'node-6411710',
      x1: 105,
      y1: 55,
      x2: 145,
      y2: 55,
    },
    {
      source: 'node-6411710',
      target: 'node-63746075',
      x1: 225,
      y1: 55,
      x2: 265,
      y2: 55,
    },
    {
      source: 'node-63746075',
      target: 'node-44216216',
      x1: 345,
      y1: 55,
      x2: 385,
      y2: 55,
    },
    {
      source: 'node-44216216',
      target: 'node-70767097',
      x1: 465,
      y1: 55,
      x2: 505,
      y2: 55,
    },
    {
      source: 'node-70767097',
      target: 'node-69466632',
      x1: 545,
      y1: 85,
      x2: 545,
      y2: 115,
    },
    {
      source: 'node-69466632',
      target: 'node-29117539',
      x1: 545,
      y1: 175,
      x2: 545,
      y2: 205,
      condition: true,
    },
    {
      source: 'node-69466632',
      target: 'node-6411710',
      x1: 505,
      y1: 145,
      x2: 180,
      y2: 85,
      condition: false,
    },
  ],
} as {
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
};

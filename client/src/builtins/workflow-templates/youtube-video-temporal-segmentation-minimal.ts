import {
  DataType,
  LabelTaskType,
  PortDirection,
  ProcessType,
  WorkflowGraph,
  WorkflowNodeType,
} from '@/commons/types';

export default {
  nodes: [
    {
      id: 'node-47353599',
      label: 'initialization',
      type: WorkflowNodeType.Initialization,
      value: {
        dataType: 'YoutubeVideo',
        labelTasks: [LabelTaskType.SpanClassification],
      },
      layout: {
        x: 40,
        y: 40,
        width: 80,
        height: 60,
      },
    },
    {
      id: 'node-6411710',
      label: 'random sampling',
      type: WorkflowNodeType.DataObjectSelection,
      value: [{
        type: ProcessType.DataObjectSelection,
        label: 'Random (Dummy)',
        id: 'Random-73417867',
        inputs: ['labels'],
        isAlgorithmic: true,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: true,
        api: 'Random',
        params: {
          nBatch: {
            value: 1,
            label: 'Selection Batch Size',
            options: [
              { value: 1, label: '1' },
              { value: 4, label: '4' },
              { value: 16, label: '16' },
              { value: 32, label: '32' },
              { value: 48, label: '48' },
              { value: 64, label: '64' },
              { value: 96, label: '96' },
            ],
          },
        },
      }],
      layout: {
        x: 160,
        y: 40,
        width: 80,
        height: 60,
      },
    },
    {
      id: 'node-63746075',
      label: 'direct labeling',
      type: WorkflowNodeType.TaskTransformation,
      value: {
        type: ProcessType.TaskTransformation,
        label: 'DirectLabeling',
        id: 'DirectLabeling-97377357',
        inputs: ['dataObjects', 'labelTask', 'labelSpace'],
        isAlgorithmic: true,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: true,
        api: 'DirectLabeling',
      },
      layout: {
        x: 280,
        y: 40,
        width: 80,
        height: 60,
      },
    },
    {
      id: 'node-44216216',
      label: 'single object display',
      type: WorkflowNodeType.InteractiveLabeling,
      value: [{
        type: ProcessType.InteractiveLabeling,
        label: 'Single Object Display',
        id: 'SingleObjectDisplay-48263667',
        inputs: ['dataObjects', 'samples'],
        isAlgorithmic: false,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: true,
        api: 'SingleObjectDisplay',
      }],
      layout: {
        x: 400,
        y: 40,
        width: 80,
        height: 60,
      },
    },
    {
      id: 'node-70767097',
      label: 'check all labeled',
      type: WorkflowNodeType.StoppageAnalysis,
      value: {
        type: ProcessType.StoppageAnalysis,
        label: 'AllChecked',
        id: 'AllChecked-46322013',
        inputs: ['labels'],
        isAlgorithmic: true,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: true,
        api: 'AllChecked',
      },
      layout: {
        x: 520,
        y: 40,
        width: 80,
        height: 60,
      },
    },
    {
      id: 'node-69466632',
      label: 'stop?',
      type: WorkflowNodeType.Decision,
      layout: {
        x: 520,
        y: 130,
        width: 80,
        height: 60,
      },
    },
    {
      id: 'node-29117539',
      label: 'exit',
      type: WorkflowNodeType.Terminal,
      layout: {
        x: 530,
        y: 220,
        width: 60,
        height: 60,
      },
    },
  ],
  edges: [
    {
      id: 'edge-78038813',
      source: 'node-47353599',
      target: 'node-6411710',
      layout: {
        source: {
          direction: PortDirection.Right,
          dx: 80,
          dy: 30,
        },
        target: {
          direction: PortDirection.Left,
          dx: 0,
          dy: 30,
        },
      },
    },
    {
      id: 'edge-79894315',
      source: 'node-6411710',
      target: 'node-63746075',
      layout: {
        source: {
          direction: PortDirection.Right,
          dx: 80,
          dy: 30,
        },
        target: {
          direction: PortDirection.Left,
          dx: 0,
          dy: 30,
        },
      },
    },
    {
      id: 'edge-23806236',
      source: 'node-63746075',
      target: 'node-44216216',
      layout: {
        source: {
          direction: PortDirection.Right,
          dx: 80,
          dy: 30,
        },
        target: {
          direction: PortDirection.Left,
          dx: 0,
          dy: 30,
        },
      },
    },
    {
      id: 'edge-41463625',
      source: 'node-44216216',
      target: 'node-70767097',
      layout: {
        source: {
          direction: PortDirection.Right,
          dx: 80,
          dy: 30,
        },
        target: {
          direction: PortDirection.Left,
          dx: 0,
          dy: 30,
        },
      },
    },
    {
      id: 'edge-25771154',
      source: 'node-70767097',
      target: 'node-69466632',
      layout: {
        source: {
          direction: PortDirection.Bottom,
          dx: 40,
          dy: 60,
        },
        target: {
          direction: PortDirection.Top,
          dx: 40,
          dy: 0,
        },
      },
    },
    {
      id: 'edge-15222705',
      source: 'node-69466632',
      target: 'node-29117539',
      condition: true,
      layout: {
        source: {
          direction: PortDirection.Bottom,
          dx: 40,
          dy: 60,
        },
        target: {
          direction: PortDirection.Top,
          dx: 30,
          dy: 0,
        },
      },
    },
    {
      id: 'edge-74991592',
      source: 'node-69466632',
      target: 'node-6411710',
      condition: false,
      layout: {
        source: {
          direction: PortDirection.Left,
          dx: 0,
          dy: 30,
        },
        target: {
          direction: PortDirection.Bottom,
          dx: 40,
          dy: 60,
        },
      },
    },
  ],
} as WorkflowGraph;

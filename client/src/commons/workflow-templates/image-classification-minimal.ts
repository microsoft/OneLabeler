import {
  DataType,
  LabelTaskType,
  ProcessType,
  WorkflowGraph,
  WorkflowNodeType,
} from '../types';

export default {
  nodes: [
    {
      id: 'node-47353599',
      label: 'initialization',
      type: WorkflowNodeType.Initialization,
      value: {
        dataType: DataType.Image,
        labelTasks: [LabelTaskType.Classification],
      },
      layout: {
        x: 25,
        y: 25,
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
            value: 16,
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
        x: 145,
        y: 25,
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
      },
      layout: {
        x: 265,
        y: 25,
        width: 80,
        height: 60,
      },
    },
    {
      id: 'node-44216216',
      label: 'grid matrix',
      type: WorkflowNodeType.InteractiveLabeling,
      value: [{
        type: ProcessType.InteractiveLabeling,
        label: 'Grid Matrix',
        id: 'Grid-Matrix',
        inputs: ['dataObjects', 'samples'],
        isAlgorithmic: false,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: true,
        params: {
          nRows: {
            value: 4,
            label: 'Number of Objects per Column',
            options: [
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 4, label: '4' },
              { value: 6, label: '6' },
              { value: 8, label: '8' },
            ],
          },
          nColumns: {
            value: 4,
            label: 'Number of Objects per Row',
            options: [
              { value: 1, label: '1' },
              { value: 4, label: '4' },
              { value: 8, label: '8' },
              { value: 12, label: '12' },
            ],
          },
        },
      }],
      layout: {
        x: 385,
        y: 25,
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
        x: 505,
        y: 25,
        width: 80,
        height: 60,
      },
    },
    {
      id: 'node-69466632',
      label: 'stop?',
      type: WorkflowNodeType.Decision,
      layout: {
        x: 505,
        y: 115,
        width: 80,
        height: 60,
      },
    },
    {
      id: 'node-29117539',
      label: 'exit',
      type: WorkflowNodeType.Terminal,
      layout: {
        x: 505,
        y: 205,
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
    },
    {
      id: 'edge-79894315',
      source: 'node-6411710',
      target: 'node-63746075',
    },
    {
      id: 'edge-23806236',
      source: 'node-63746075',
      target: 'node-44216216',
    },
    {
      id: 'edge-41463625',
      source: 'node-44216216',
      target: 'node-70767097',
    },
    {
      id: 'edge-25771154',
      source: 'node-70767097',
      target: 'node-69466632',
    },
    {
      id: 'edge-15222705',
      source: 'node-69466632',
      target: 'node-29117539',
      condition: true,
    },
    {
      id: 'edge-74991592',
      source: 'node-69466632',
      target: 'node-6411710',
      condition: false,
    },
  ],
} as WorkflowGraph;

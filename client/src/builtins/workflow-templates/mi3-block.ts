import ObjectId from 'bson-objectid';
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
        dataType: 'MI3-block',
        labelTasks: [LabelTaskType.Classification],
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
      label: 'active learning',
      type: WorkflowNodeType.DataObjectSelection,
      value: [{
        type: ProcessType.DataObjectSelection,
        label: 'EntropyDiversityDensity (Active Learning)',
        id: 'EntropyDiversityDensity-60957928',
        inputs: ['features', 'labels', 'model'],
        isAlgorithmic: true,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: false,
        api: 'http://localhost:8005/selection/EntropyDiversityDensity',
        params: {
          nBatch: {
            value: 16,
            label: 'Selection Batch Size',
            options: [{ value: 16, label: '16' }],
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
      id: 'node-86803967',
      label: 'decision tree prelabel',
      type: WorkflowNodeType.DefaultLabeling,
      value: {
        type: ProcessType.DefaultLabeling,
        label: 'ModelPrediction',
        id: 'ModelPrediction-29967546',
        inputs: ['features', 'model'],
        isAlgorithmic: true,
        isBuiltIn: true,
        isModelBased: true,
        isServerless: false,
        model: {
          type: 'DecisionTree',
          label: 'DecisionTree (Supervised)',
          objectId: (new ObjectId('DecisionTree')).toHexString(),
          isBuiltIn: true,
          isServerless: false,
          isValidSampler: false,
        },
        api: 'http://localhost:8005/defaultLabels/ModelPrediction',
      },
      layout: {
        x: 280,
        y: 40,
        width: 80,
        height: 60,
      },
    },
    {
      id: 'node-44355165',
      label: 'overview',
      type: WorkflowNodeType.DataObjectSelection,
      value: [{
        type: ProcessType.DataObjectSelection,
        label: 'Overview (User Sampling)',
        id: 'ImageOverview',
        inputs: ['dataObjects', 'labels'],
        isAlgorithmic: false,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: true,
        api: 'ImageOverview',
      }],
      layout: {
        x: 400,
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
        x: 520,
        y: 40,
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
        id: 'GridMatrix-89670576',
        inputs: ['dataObjects', 'samples'],
        isAlgorithmic: false,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: true,
        api: 'GridMatrix',
        params: {
          nRows: {
            value: 4,
            label: 'Number of Objects per Column',
            options: [{ value: 4, label: '4' }],
          },
          nColumns: {
            value: 4,
            label: 'Number of Objects per Row',
            options: [{ value: 4, label: '4' }],
          },
        },
      }],
      layout: {
        x: 520,
        y: 140,
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
        x: 400,
        y: 140,
        width: 80,
        height: 60,
      },
    },
    {
      id: 'node-69466632',
      label: 'stop?',
      type: WorkflowNodeType.Decision,
      layout: {
        x: 280,
        y: 140,
        width: 80,
        height: 60,
      },
    },
    {
      id: 'node-29117539',
      label: 'exit',
      type: WorkflowNodeType.Terminal,
      layout: {
        x: 290,
        y: 240,
        width: 60,
        height: 60,
      },
    },
    {
      id: 'node-14283634',
      label: 'interim model training',
      type: WorkflowNodeType.InterimModelTraining,
      value: {
        type: ProcessType.InterimModelTraining,
        label: 'Retrain',
        id: 'Retrain-16440841',
        inputs: ['features', 'labels', 'model'],
        isAlgorithmic: true,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: false,
        api: 'http://localhost:8005/modelUpdated/Retrain',
      },
      layout: {
        x: 160,
        y: 140,
        width: 80,
        height: 60,
      },
    },
  ],
  edges: [
    {
      id: 'edge-97454187',
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
      id: 'edge-55337014',
      source: 'node-6411710',
      target: 'node-86803967',
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
      id: 'edge-33448528',
      source: 'node-86803967',
      target: 'node-44355165',
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
      id: 'edge-13012653',
      source: 'node-44355165',
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
      id: 'edge-41463625',
      source: 'node-44216216',
      target: 'node-70767097',
      layout: {
        source: {
          direction: PortDirection.Left,
          dx: 0,
          dy: 30,
        },
        target: {
          direction: PortDirection.Right,
          dx: 80,
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
          direction: PortDirection.Left,
          dx: 0,
          dy: 30,
        },
        target: {
          direction: PortDirection.Right,
          dx: 80,
          dy: 30,
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
      id: 'edge-7667809',
      source: 'node-69466632',
      target: 'node-14283634',
      condition: false,
      layout: {
        source: {
          direction: PortDirection.Left,
          dx: 0,
          dy: 30,
        },
        target: {
          direction: PortDirection.Right,
          dx: 80,
          dy: 30,
        },
      },
    },
    {
      id: 'edge-94048020',
      source: 'node-14283634',
      target: 'node-6411710',
      layout: {
        source: {
          direction: PortDirection.Top,
          dx: 40,
          dy: 0,
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

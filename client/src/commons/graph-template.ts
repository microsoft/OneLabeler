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
      title: 'label task',
      type: WorkflowNodeType.LabelTask,
      value: [],
      x: 25,
      y: 25,
    },
    {
      id: 'node-37008559',
      title: 'feature extraction',
      type: WorkflowNodeType.FeatureExtraction,
      value: new Process({
        type: ProcessType.FeatureExtraction,
        name: 'SVD (Unsupervised)',
        id: 'image-SVD-25940167',
        inputs: ['dataObjects'],
        isAlgorithmic: true,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: false,
        api: 'http://localhost:8005/features/image/SVD',
      }),
      x: 145,
      y: 25,
    },
    {
      id: 'node-6411710',
      title: 'data object selection',
      type: WorkflowNodeType.DataObjectSelection,
      value: [],
      x: 265,
      y: 25,
    },
    {
      id: 'node-86803967',
      title: 'default labeling',
      type: WorkflowNodeType.DefaultLabeling,
      value: new Process({
        type: ProcessType.DefaultLabeling,
        name: 'Null (Dummy)',
        id: 'Null-35514905',
        inputs: ['features'],
        isAlgorithmic: true,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: true,
        api: 'Null',
      }),
      x: 385,
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
      x: 505,
      y: 25,
    },
    {
      id: 'node-44216216',
      title: 'interactive labeling',
      type: WorkflowNodeType.InteractiveLabeling,
      value: [],
      x: 625,
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
      x: 745,
      y: 25,
    },
    {
      id: 'node-69466632',
      title: 'stop?',
      type: WorkflowNodeType.Decision,
      x: 745,
      y: 115,
    },
    {
      id: 'node-29117539',
      title: 'exit',
      type: WorkflowNodeType.Terminal,
      x: 745,
      y: 205,
    },
    {
      id: 'node-14283634',
      title: 'interim model training',
      type: WorkflowNodeType.InterimModelTraining,
      value: new Process({
        type: ProcessType.InterimModelTraining,
        name: 'Static',
        id: 'Static-72885436',
        inputs: ['model'],
        isAlgorithmic: true,
        isBuiltIn: true,
        isModelBased: false,
        isServerless: true,
        api: 'Static',
      }),
      x: 265,
      y: 115,
    },
  ],
  edges: [
    {
      source: 'node-47353599', target: 'node-37008559', x1: 105, y1: 55, x2: 145, y2: 55,
    },
    {
      source: 'node-37008559', target: 'node-6411710', x1: 225, y1: 55, x2: 265, y2: 55,
    },
    {
      source: 'node-6411710', target: 'node-86803967', x1: 345, y1: 55, x2: 385, y2: 55,
    },
    {
      source: 'node-86803967', target: 'node-63746075', x1: 465, y1: 55, x2: 505, y2: 55,
    },
    {
      source: 'node-63746075', target: 'node-44216216', x1: 585, y1: 55, x2: 625, y2: 55,
    },
    {
      source: 'node-44216216', target: 'node-70767097', x1: 705, y1: 55, x2: 745, y2: 55,
    },
    {
      source: 'node-70767097', target: 'node-69466632', x1: 785, y1: 85, x2: 785, y2: 115,
    },
    {
      source: 'node-69466632', target: 'node-29117539', x1: 745, y1: 145, x2: 345, y2: 145,
    },
    {
      source: 'node-69466632', target: 'node-14283634', x1: 785, y1: 175, x2: 785, y2: 205,
    },
    {
      source: 'node-14283634', target: 'node-6411710', x1: 305, y1: 115, x2: 305, y2: 85,
    },
  ],
} as {
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
};

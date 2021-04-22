import { Process, NodeTypes } from './types';

export default {
  nodes: [
    {
      id: 'node-47353599',
      title: 'label task',
      type: NodeTypes.LabelTask,
      value: [],
      x: 25,
      y: 25,
    },
    {
      id: 'node-37008559',
      title: 'feature extraction',
      type: NodeTypes.FeatureExtraction,
      value: {
        method: new Process({
          name: 'SVD (Unsupervised)',
          isServerless: false,
          api: 'http://localhost:8005/features/image/SVD',
          inputs: ['dataObjects'],
          isBuiltIn: true,
          id: 'image-SVD-25940167',
        }),
      },
      x: 145,
      y: 25,
    },
    {
      id: 'node-6411710',
      title: 'data object selection',
      type: NodeTypes.DataObjectSelection,
      value: [],
      x: 265,
      y: 25,
    },
    {
      id: 'node-86803967',
      title: 'default labeling',
      type: NodeTypes.DefaultLabeling,
      value: {
        method: new Process({
          name: 'Null (Dummy)',
          isServerless: true,
          api: 'Null',
          inputs: ['features'],
          isBuiltIn: true,
          id: 'Null-35514905',
        }),
        model: {},
      },
      x: 385,
      y: 25,
    },
    {
      id: 'node-63746075',
      title: 'task transform',
      type: NodeTypes.TaskTransformation,
      value: {
        method: new Process({
          name: 'DirectLabeling',
          inputs: ['dataObjects', 'labelTask', 'labelSpace'],
          isBuiltIn: true,
          id: 'DirectLabeling-97377357',
        }),
      },
      x: 505,
      y: 25,
    },
    {
      id: 'node-44216216',
      title: 'interactive labeling',
      type: NodeTypes.InteractiveLabeling,
      value: [],
      x: 625,
      y: 25,
    },
    {
      id: 'node-70767097',
      title: 'stoppage analysis',
      type: NodeTypes.StoppageAnalysis,
      value: {
        method: new Process({
          name: 'AllChecked',
          isServerless: true,
          api: 'AllChecked',
          inputs: ['labels'],
          isBuiltIn: true,
          id: 'AllChecked-46322013',
        }),
      },
      x: 745,
      y: 25,
    },
    {
      id: 'node-69466632',
      title: 'stop?',
      type: NodeTypes.Decision,
      x: 745,
      y: 115,
    },
    {
      id: 'node-29117539',
      title: 'exit',
      type: NodeTypes.Terminal,
      x: 745,
      y: 205,
    },
    {
      id: 'node-14283634',
      title: 'interim model training',
      type: NodeTypes.InterimModelTraining,
      value: {
        method: new Process({
          name: 'Static',
          isServerless: true,
          api: 'Static',
          inputs: ['model'],
          isBuiltIn: true,
          id: 'Static-72885436',
        }),
      },
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
};

import { cloneDeep, merge } from 'lodash';
import ObjectId from 'bson-objectid';
import {
  LabelTaskType,
  PortDirection,
  ProcessType,
  WorkflowGraph,
  WorkflowNodeType,
} from '@/commons/types';
import { parseWorkflow } from '@/commons/workflow-utils';
import DOSEntropyDiversityDensity from '@/builtins/modules/data-object-selection/entropy-diversity-density';
import DOSImageOverview from '@/builtins/modules/data-object-selection/image-overview';
import ILGridMatrix from '@/builtins/modules/interactive-labeling/grid-matrix';
import MTRetrain from '@/builtins/modules/model-training/retrain';
import SAAllChecked from '@/builtins/modules/stoppage-analysis/all-checked';

export default parseWorkflow({
  label: 'MI3 Block',
  nodes: [
    {
      label: 'initialization',
      type: WorkflowNodeType.Initialization,
      value: {
        dataType: 'MI3-block',
        labelTasks: [LabelTaskType.Classification],
      },
      layout: { x: 40, y: 40 },
    },
    {
      label: 'active learning',
      type: WorkflowNodeType.DataObjectSelection,
      value: [merge(cloneDeep(DOSEntropyDiversityDensity), {
        params: {
          nBatch: {
            value: 16,
            options: [{ value: 16, label: '16' }],
          },
        },
      })],
      layout: { x: 160, y: 40 },
    },
    {
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
      label: 'overview',
      type: WorkflowNodeType.DataObjectSelection,
      value: [DOSImageOverview],
      layout: { x: 400, y: 40 },
    },
    {
      label: 'grid matrix',
      type: WorkflowNodeType.InteractiveLabeling,
      value: [merge(cloneDeep(ILGridMatrix), {
        params: {
          nRows: {
            value: 4,
            options: [{ value: 4, label: '4' }],
          },
          nColumns: {
            value: 4,
            options: [{ value: 4, label: '4' }],
          },
        },
      })],
      layout: { x: 400, y: 140 },
    },
    {
      label: 'check all labeled',
      type: WorkflowNodeType.StoppageAnalysis,
      value: SAAllChecked,
      layout: { x: 280, y: 140 },
    },
    {
      label: 'stop?',
      type: WorkflowNodeType.Decision,
      layout: { x: 160, y: 140 },
    },
    {
      label: 'exit',
      type: WorkflowNodeType.Exit,
      layout: { x: 170, y: 240 },
    },
    {
      label: 'model training',
      type: WorkflowNodeType.ModelTraining,
      value: MTRetrain,
      layout: { x: 40, y: 140 },
    },
  ],
  edges: [
    { source: 'initialization', target: 'active learning' },
    { source: 'active learning', target: 'decision tree prelabel' },
    { source: 'decision tree prelabel', target: 'overview' },
    { source: 'overview', target: 'grid matrix' },
    { source: 'grid matrix', target: 'check all labeled' },
    { source: 'check all labeled', target: 'stop?' },
    { source: 'stop?', target: 'exit', condition: true },
    { source: 'stop?', target: 'model training', condition: false },
    {
      source: 'model training',
      target: 'active learning',
      layout: {
        source: { direction: PortDirection.Top },
        target: { direction: PortDirection.Bottom },
      },
    },
  ],
} as WorkflowGraph);

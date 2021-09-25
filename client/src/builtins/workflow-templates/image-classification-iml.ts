import { cloneDeep, merge } from 'lodash';
import ObjectId from 'bson-objectid';
import {
  DataType,
  LabelTaskType,
  PortDirection,
  ProcessType,
  WorkflowGraph,
  WorkflowNodeType,
} from '@/commons/types';
import { parseWorkflowGraph } from '@/commons/workflow-scaffold';
import DOSCluster from '@/builtins/modules/data-object-selection-cluster';
import DOSProjection from '@/builtins/modules/data-object-selection-projection';
import FEImageSvd from '@/builtins/modules/feature-extraction-image-svd';
import ILGridMatrix from '@/builtins/modules/interactive-labeling-grid-matrix';
import MTRetrain from '@/builtins/modules/model-training-retrain';
import SAAllChecked from '@/builtins/modules/stoppage-analysis-all-checked';

export default parseWorkflowGraph({
  label: 'Image Classification with IML',
  nodes: [
    {
      label: 'initialization',
      type: WorkflowNodeType.Initialization,
      value: {
        dataType: DataType.Image,
        labelTasks: [LabelTaskType.Classification],
      },
      layout: { x: 40, y: 40 },
    },
    {
      label: 'SVD features',
      type: WorkflowNodeType.FeatureExtraction,
      value: FEImageSvd,
      layout: { x: 160, y: 40 },
    },
    {
      label: 'clustering',
      type: WorkflowNodeType.DataObjectSelection,
      value: [merge(cloneDeep(DOSCluster), {
        params: { nBatch: { value: 16 } },
      })],
      layout: { x: 280, y: 40 },
    },
    {
      id: 'decision tree prelabel - 1',
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
      layout: { x: 400, y: 40 },
    },
    {
      label: 'projection',
      type: WorkflowNodeType.DataObjectSelection,
      value: [DOSProjection],
      layout: { x: 520, y: 40 },
    },
    {
      id: 'decision tree prelabel - 2',
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
      layout: { x: 520, y: 140 },
    },
    {
      label: 'grid matrix',
      type: WorkflowNodeType.InteractiveLabeling,
      value: [merge(cloneDeep(ILGridMatrix), {
        params: {
          nRows: { value: 4 },
          nColumns: { value: 4 },
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
    { source: 'initialization', target: 'SVD features' },
    { source: 'SVD features', target: 'clustering' },
    { source: 'clustering', target: 'decision tree prelabel - 1' },
    { source: 'decision tree prelabel - 1', target: 'projection' },
    { source: 'projection', target: 'decision tree prelabel - 2' },
    { source: 'decision tree prelabel - 2', target: 'grid matrix' },
    { source: 'grid matrix', target: 'check all labeled' },
    { source: 'check all labeled', target: 'stop?' },
    { source: 'stop?', target: 'exit', condition: true },
    { source: 'stop?', target: 'model training', condition: false },
    {
      source: 'model training',
      target: 'clustering',
      layout: {
        source: { direction: PortDirection.Top },
        target: { direction: PortDirection.Bottom },
      },
    },
  ],
} as WorkflowGraph);

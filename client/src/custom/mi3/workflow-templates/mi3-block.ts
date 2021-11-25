import { cloneDeep, merge } from 'lodash';
import ObjectId from 'bson-objectid';
import {
  LabelTaskType,
  PortDirection,
  ProcessType,
  WorkflowNodeType,
} from '@/commons/types';
import type { WorkflowGraph } from '@/commons/types';
import { parseWorkflow } from '@/commons/workflow-utils';
import DOSEntropyDiversityDensity from '@/builtins/modules/data-object-selection/entropy-diversity-density';
import DOSImageOverview from '@/builtins/modules/data-object-selection/image-overview';
import ILGridMatrix from '@/builtins/modules/interactive-labeling/grid-matrix';
import MTRetrain from '@/builtins/modules/model-training/retrain';
import SAAllChecked from '@/builtins/modules/stoppage-analysis/all-checked';

const MARGIN_LEFT = 20;
const MARGIN_TOP = 20;
const NODE_WIDTH = 120;
const NODE_HEIGHT = 80;
const NODE_PADDING_X = 40;
const NODE_PADDING_Y = 20;

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
      layout: { x: MARGIN_LEFT, y: MARGIN_TOP },
    },
    {
      label: 'active learning',
      type: WorkflowNodeType.DataObjectSelection,
      value: merge(cloneDeep(DOSEntropyDiversityDensity), {
        params: {
          nBatch: {
            value: 16,
            options: [{ value: 16, label: '16' }],
          },
        },
      }),
      layout: {
        x: MARGIN_LEFT + (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
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
        x: MARGIN_LEFT + 2 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'overview',
      type: WorkflowNodeType.DataObjectSelection,
      value: DOSImageOverview,
      layout: {
        x: MARGIN_LEFT + 3 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'grid matrix',
      type: WorkflowNodeType.InteractiveLabeling,
      value: merge(cloneDeep(ILGridMatrix), {
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
      }),
      layout: {
        x: MARGIN_LEFT + 3 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP + (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
    {
      label: 'check all labeled',
      type: WorkflowNodeType.StoppageAnalysis,
      value: SAAllChecked,
      layout: {
        x: MARGIN_LEFT + 2 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP + (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
    {
      label: 'stop?',
      type: WorkflowNodeType.Decision,
      layout: {
        x: MARGIN_LEFT + (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP + (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
    {
      label: 'exit',
      type: WorkflowNodeType.Exit,
      layout: {
        x: MARGIN_LEFT + 20 + (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP + 2 * (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
    {
      label: 'model training',
      type: WorkflowNodeType.ModelTraining,
      value: MTRetrain,
      layout: {
        x: MARGIN_LEFT,
        y: MARGIN_TOP + (NODE_HEIGHT + NODE_PADDING_Y),
      },
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

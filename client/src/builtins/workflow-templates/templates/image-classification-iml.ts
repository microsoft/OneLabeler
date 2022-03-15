// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { cloneDeep, merge } from 'lodash';
import ObjectId from 'bson-objectid';
import {
  DataType,
  LabelTaskType,
  PortDirection,
  WorkflowNodeType,
} from '@/commons/types';
import type { WorkflowGraph } from '@/commons/types';
import { parseWorkflow } from '@/commons/workflow-utils';
import BaseInitialization from '@/builtins/modules/initialization/base';
import DOSCluster from '@/builtins/modules/data-object-selection/cluster';
import DOSProjection from '@/builtins/modules/data-object-selection/projection';
import FEImageSvd from '@/builtins/modules/feature-extraction/image-svd';
import ILGridMatrix from '@/builtins/modules/interactive-labeling/grid-matrix';
import MTRetrain from '@/builtins/modules/model-training/retrain';
import SAAllChecked from '@/builtins/modules/stoppage-analysis/all-checked';
import DLModelPrediction from '@/builtins/modules/default-labeling/model-prediction';

const MARGIN_LEFT = 20;
const MARGIN_TOP = 20;
const NODE_WIDTH = 120;
const NODE_HEIGHT = 80;
const NODE_PADDING_X = 40;
const NODE_PADDING_Y = 20;

const model = {
  type: 'DecisionTree',
  label: 'DecisionTree (Supervised)',
  objectId: (new ObjectId('DecisionTree')).toHexString(),
  isBuiltIn: true,
  isServerless: false,
  isValidSampler: false,
};

export default parseWorkflow({
  label: 'Image Classification with IML',
  nodes: [
    {
      label: 'initialization',
      type: WorkflowNodeType.Initialization,
      value: merge(cloneDeep(BaseInitialization), {
        params: {
          dataType: { value: DataType.Image },
          labelTasks: { value: [LabelTaskType.Classification] },
        },
        outputs: ['dataObjects', 'labels', 'model'],
      }),
      layout: { x: MARGIN_LEFT, y: MARGIN_TOP },
    },
    {
      label: 'SVD features',
      type: WorkflowNodeType.FeatureExtraction,
      value: FEImageSvd,
      layout: {
        x: MARGIN_LEFT + (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'clustering',
      type: WorkflowNodeType.DataObjectSelection,
      value: merge(cloneDeep(DOSCluster), {
        params: { nBatch: { value: 16 } },
      }),
      layout: {
        x: MARGIN_LEFT + 2 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'projection',
      type: WorkflowNodeType.DataObjectSelection,
      value: DOSProjection,
      layout: {
        x: MARGIN_LEFT + 3 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      id: 'decision tree prelabel',
      label: 'decision tree prelabel',
      type: WorkflowNodeType.DefaultLabeling,
      value: cloneDeep({ ...DLModelPrediction, model }),
      layout: {
        x: MARGIN_LEFT + 4 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'grid matrix',
      type: WorkflowNodeType.InteractiveLabeling,
      value: merge(cloneDeep(ILGridMatrix), {
        params: {
          nRows: { value: 4 },
          nColumns: { value: 4 },
        },
      }),
      layout: {
        x: MARGIN_LEFT + 4 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP + (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
    {
      label: 'check all labeled',
      type: WorkflowNodeType.StoppageAnalysis,
      value: SAAllChecked,
      layout: {
        x: MARGIN_LEFT + 3 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP + (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
    {
      label: 'stop?',
      type: WorkflowNodeType.Decision,
      layout: {
        x: MARGIN_LEFT + 2 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP + (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
    {
      label: 'model training',
      type: WorkflowNodeType.ModelTraining,
      value: cloneDeep({ ...MTRetrain, model }),
      layout: {
        x: MARGIN_LEFT + (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP + (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
    {
      label: 'exit',
      type: WorkflowNodeType.Exit,
      layout: {
        x: MARGIN_LEFT,
        y: MARGIN_TOP + (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
  ],
  edges: [
    { source: 'initialization', target: 'SVD features' },
    { source: 'SVD features', target: 'clustering' },
    { source: 'clustering', target: 'projection' },
    { source: 'projection', target: 'decision tree prelabel' },
    { source: 'decision tree prelabel', target: 'grid matrix' },
    { source: 'grid matrix', target: 'check all labeled' },
    { source: 'check all labeled', target: 'stop?' },
    {
      source: 'stop?',
      target: 'exit',
      condition: true,
      layout: {
        source: { direction: PortDirection.Bottom },
        target: { direction: PortDirection.Bottom },
      },
    },
    {
      source: 'stop?',
      target: 'model training',
      condition: false,
    },
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

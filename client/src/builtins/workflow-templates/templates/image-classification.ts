// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DataType,
  LabelTaskType,
  PortDirection,
  WorkflowNodeType,
} from '@/commons/types';
import { parseWorkflow } from '@/commons/workflow-utils';
import BaseInitialization from '@/builtins/modules/initialization/base';
import BaseDecision from '@/builtins/modules/decision/base';
import DOSRandom from '@/builtins/modules/data-object-selection/random';
import ILGridMatrix from '@/builtins/modules/interactive-labeling/grid-matrix';
import SAAllChecked from '@/builtins/modules/stoppage-analysis/all-checked';

const MARGIN_LEFT = 20;
const MARGIN_TOP = 20;
const NODE_WIDTH = 120;
const NODE_HEIGHT = 80;
const NODE_PADDING_X = 40;
const NODE_PADDING_Y = 20;

export default parseWorkflow({
  label: 'Image Classification',
  nodes: [
    {
      label: 'initialization',
      type: WorkflowNodeType.Initialization,
      value: new BaseInitialization({
        dataType: DataType.Image,
        labelTasks: [LabelTaskType.Classification],
      }),
      layout: { x: MARGIN_LEFT, y: MARGIN_TOP },
    },
    {
      label: 'random sampling',
      type: WorkflowNodeType.DataObjectSelection,
      value: new DOSRandom({ nBatch: 32 }),
      layout: {
        x: MARGIN_LEFT + (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'grid matrix',
      type: WorkflowNodeType.InteractiveLabeling,
      value: new ILGridMatrix({ nRows: 4, nColumns: 8 }),
      layout: {
        x: MARGIN_LEFT + 2 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'check all labeled',
      type: WorkflowNodeType.StoppageAnalysis,
      value: new SAAllChecked(),
      layout: {
        x: MARGIN_LEFT + 3 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'stop?',
      type: WorkflowNodeType.Decision,
      value: new BaseDecision(),
      layout: {
        x: MARGIN_LEFT + 3 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP + (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
    {
      label: 'exit',
      type: WorkflowNodeType.Exit,
      layout: {
        x: MARGIN_LEFT + 3 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP + 2 * (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
  ],
  edges: [
    { source: 'initialization', target: 'random sampling' },
    { source: 'random sampling', target: 'grid matrix' },
    { source: 'grid matrix', target: 'check all labeled' },
    { source: 'check all labeled', target: 'stop?' },
    {
      source: 'stop?',
      target: 'exit',
      condition: true,
    },
    {
      source: 'stop?',
      target: 'random sampling',
      condition: false,
      layout: {
        source: { direction: PortDirection.Left },
        target: { direction: PortDirection.Bottom },
      },
    },
  ],
});

console.log('base initialization', BaseInitialization);

console.log('initialization', new BaseInitialization({
  dataType: DataType.Image,
  labelTasks: [LabelTaskType.Classification],
}));

console.log('workflow',
parseWorkflow({
  label: 'Image Classification',
  nodes: [
    {
      label: 'initialization',
      type: WorkflowNodeType.Initialization,
      value: new BaseInitialization({
        dataType: DataType.Image,
        labelTasks: [LabelTaskType.Classification],
      }),
      layout: { x: MARGIN_LEFT, y: MARGIN_TOP },
    },
    {
      label: 'random sampling',
      type: WorkflowNodeType.DataObjectSelection,
      value: new DOSRandom({ nBatch: 32 }),
      layout: {
        x: MARGIN_LEFT + (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'grid matrix',
      type: WorkflowNodeType.InteractiveLabeling,
      value: new ILGridMatrix({ nRows: 4, nColumns: 8 }),
      layout: {
        x: MARGIN_LEFT + 2 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'check all labeled',
      type: WorkflowNodeType.StoppageAnalysis,
      value: new SAAllChecked(),
      layout: {
        x: MARGIN_LEFT + 3 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'stop?',
      type: WorkflowNodeType.Decision,
      value: new BaseDecision(),
      layout: {
        x: MARGIN_LEFT + 3 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP + (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
    {
      label: 'exit',
      type: WorkflowNodeType.Exit,
      layout: {
        x: MARGIN_LEFT + 3 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP + 2 * (NODE_HEIGHT + NODE_PADDING_Y),
      },
    },
  ],
  edges: [
    { source: 'initialization', target: 'random sampling' },
    { source: 'random sampling', target: 'grid matrix' },
    { source: 'grid matrix', target: 'check all labeled' },
    { source: 'check all labeled', target: 'stop?' },
    {
      source: 'stop?',
      target: 'exit',
      condition: true,
    },
    {
      source: 'stop?',
      target: 'random sampling',
      condition: false,
      layout: {
        source: { direction: PortDirection.Left },
        target: { direction: PortDirection.Bottom },
      },
    },
  ],
}))

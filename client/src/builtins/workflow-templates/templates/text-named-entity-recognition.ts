// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { cloneDeep, merge } from 'lodash';
import {
  DataType,
  LabelTaskType,
  PortDirection,
  WorkflowNodeType,
} from '@/commons/types';
import type { WorkflowGraph } from '@/commons/types';
import { parseWorkflow } from '@/commons/workflow-utils';
import BaseInitialization from '@/builtins/modules/initialization/base';
import DOSRandom from '@/builtins/modules/data-object-selection/random';
import ILSingleObjectDisplay from '@/builtins/modules/interactive-labeling/single-object-display';
import SAAllChecked from '@/builtins/modules/stoppage-analysis/all-checked';

const MARGIN_LEFT = 20;
const MARGIN_TOP = 20;
const NODE_WIDTH = 120;
const NODE_HEIGHT = 80;
const NODE_PADDING_X = 40;
const NODE_PADDING_Y = 20;

export default parseWorkflow({
  label: 'Text Named Entity Recognition',
  nodes: [
    {
      label: 'initialization',
      type: WorkflowNodeType.Initialization,
      value: merge(cloneDeep(BaseInitialization), {
        params: {
          dataType: { value: DataType.Text },
          labelTasks: {
            value: [
              LabelTaskType.SpanClassification,
              LabelTaskType.AnnotationRelation,
            ],
          },
        },
      }),
      layout: { x: MARGIN_LEFT, y: MARGIN_TOP },
    },
    {
      label: 'random sampling',
      type: WorkflowNodeType.DataObjectSelection,
      value: merge(cloneDeep(DOSRandom), {
        params: { nBatch: { value: 1 } },
      }),
      layout: {
        x: MARGIN_LEFT + (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'single object display',
      type: WorkflowNodeType.InteractiveLabeling,
      value: ILSingleObjectDisplay,
      layout: {
        x: MARGIN_LEFT + 2 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'check all labeled',
      type: WorkflowNodeType.StoppageAnalysis,
      value: SAAllChecked,
      layout: {
        x: MARGIN_LEFT + 3 * (NODE_WIDTH + NODE_PADDING_X),
        y: MARGIN_TOP,
      },
    },
    {
      label: 'stop?',
      type: WorkflowNodeType.Decision,
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
    { source: 'random sampling', target: 'single object display' },
    { source: 'single object display', target: 'check all labeled' },
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
} as WorkflowGraph);

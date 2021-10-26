import { cloneDeep, merge } from 'lodash';
import {
  DataType,
  LabelTaskType,
  PortDirection,
  WorkflowGraph,
  WorkflowNodeType,
} from '@/commons/types';
import { parseWorkflow } from '@/commons/workflow-utils';
import DOSRandom from '@/builtins/modules/data-object-selection/random';
import ILSingleObjectDisplay from '@/builtins/modules/interactive-labeling/single-object-display';
import SAAllChecked from '@/builtins/modules/stoppage-analysis/all-checked';

export default parseWorkflow({
  label: 'Image Segmentation',
  nodes: [
    {
      label: 'initialization',
      type: WorkflowNodeType.Initialization,
      value: {
        dataType: DataType.Image,
        labelTasks: [LabelTaskType.Segmentation2d],
      },
      layout: { x: 40, y: 40 },
    },
    {
      label: 'random sampling',
      type: WorkflowNodeType.DataObjectSelection,
      value: [merge(cloneDeep(DOSRandom), {
        params: { nBatch: { value: 1 } },
      })],
      layout: { x: 160, y: 40 },
    },
    {
      label: 'single object display',
      type: WorkflowNodeType.InteractiveLabeling,
      value: [ILSingleObjectDisplay],
      layout: { x: 280, y: 40 },
    },
    {
      label: 'check all labeled',
      type: WorkflowNodeType.StoppageAnalysis,
      value: SAAllChecked,
      layout: { x: 400, y: 40 },
    },
    {
      label: 'stop?',
      type: WorkflowNodeType.Decision,
      layout: { x: 400, y: 130 },
    },
    {
      label: 'exit',
      type: WorkflowNodeType.Exit,
      layout: { x: 410, y: 220 },
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

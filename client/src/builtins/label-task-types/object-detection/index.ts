// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LabelTaskType } from '@/commons/types';
import type { ILabelTaskTypeSetup } from '@/commons/types';
import BaseSingleTool from './BaseSingleTool.vue';

export default {
  type: LabelTaskType.ObjectDetection,
  label: 'object detection',
  singleTool: BaseSingleTool,
} as ILabelTaskTypeSetup;

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LabelTaskType } from '@/commons/types';
import type { ILabelTaskTypeSetup } from '@/commons/types';
import BaseSingleTool from './BaseSingleTool.vue';
import BaseBatchTool from './BaseBatchTool.vue';

export default {
  type: LabelTaskType.Classification,
  label: 'classification',
  singleTool: BaseSingleTool,
  batchTool: BaseBatchTool,
} as ILabelTaskTypeSetup;

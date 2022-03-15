// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LabelTaskType } from '@/commons/types';
import type { ILabelTaskTypeSetup } from '@/commons/types';
import BaseSingleTool from './BaseSingleTool.vue';
// import BasePanel from './BasePanel.vue';

export default {
  type: LabelTaskType.FreeformText,
  label: 'freeform text',
  singleTool: BaseSingleTool,
  // panel: BasePanel,
} as ILabelTaskTypeSetup;

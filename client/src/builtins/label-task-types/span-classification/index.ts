// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LabelTaskType } from '@/commons/types';
import type { ILabelTaskTypeSetup } from '@/commons/types';
import BaseSingleTool from './BaseSingleTool.vue';
import BasePanel from './BasePanel.vue';
import BaseOverlay from './BaseOverlay.vue';

export default {
  type: LabelTaskType.SpanClassification,
  label: 'span tagging',
  singleTool: BaseSingleTool,
  panel: BasePanel,
  overlay: BaseOverlay,
} as ILabelTaskTypeSetup;

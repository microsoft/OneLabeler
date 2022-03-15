// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LabelTaskType } from '@/commons/types';
import type { ILabelTaskTypeSetup } from '@/commons/types';
import BasePanel from './BasePanel.vue';

export default {
  type: LabelTaskType.AnnotationRelation,
  label: 'span relation',
  panel: BasePanel,
} as ILabelTaskTypeSetup;

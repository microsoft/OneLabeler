// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DataType,
  LabelTaskType,
  ModuleType,
} from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';
import BaseDefaultLabelingServerModule from './utils/base';

export default class PosTagging extends BaseDefaultLabelingServerModule {
  readonly inputs = ['dataObjects', 'queryUuids'];

  readonly outputs = ['labels'];

  readonly id = 'DefaultLabeling-POS-tagging';

  readonly label = 'POS-tagging';

  readonly type = ModuleType.DefaultLabeling;

  readonly dataTypes = [DataType.Text];

  readonly labelTasks = [LabelTaskType.SpanClassification];

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = false;

  api = `${ALGORITHM_URL}/defaultLabels/POS-tagging`;
}

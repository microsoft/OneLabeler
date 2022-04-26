// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';
import BaseDefaultLabelingServerModule from './utils/base';

export default class ModelPrediction extends BaseDefaultLabelingServerModule {
  readonly inputs = ['features', 'queryUuids', 'model', 'categories'];

  readonly outputs = ['labels'];

  readonly id = 'DefaultLabeling-ModelPrediction';

  readonly label = 'Model Prediction';

  readonly type = ModuleType.DefaultLabeling;

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = false;

  api = `${ALGORITHM_URL}/defaultLabels/ModelPrediction`;
}

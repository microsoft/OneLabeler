// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ALGORITHM_URL } from '@/services/http-params';
import { ParamOptions } from '@/builtins/modules/base-module';
import BaseDataObjectSelectionServerModule from './utils/base';

export default class Cluster extends BaseDataObjectSelectionServerModule {
  readonly inputs = ['features', 'labels'];

  readonly outputs = ['queryUuids'];

  readonly id = 'DataObjectSelection-Cluster';

  readonly label = 'Cluster (Clustering)';

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly api = `${ALGORITHM_URL}/selection/Cluster`;

  constructor(paramOptions?: Partial<ParamOptions>) {
    super(paramOptions);
    this.params.nBatch.value = 16;
  }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ALGORITHM_URL } from '@/services/http-params';
import BaseDataObjectSelectionServerModule from './utils/base';

export default class DenseAreas extends BaseDataObjectSelectionServerModule {
  readonly inputs = ['features', 'labels'];

  readonly outputs = ['queryUuids'];

  readonly id = 'DataObjectSelection-DenseAreas';

  readonly label = 'DenseAreas (Clustering)';

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly api = `${ALGORITHM_URL}/selection/DenseAreas`;
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ALGORITHM_URL } from '@/services/http-params';
import BaseDataObjectSelectionServerModule from './utils/base';

export default class ClusterCentroids extends BaseDataObjectSelectionServerModule {
  readonly inputs = ['features', 'labels'];

  readonly outputs = ['queryUuids'];

  readonly id = 'DataObjectSelection-ClusterCentroids';

  readonly label = 'ClusterCentroids (Clustering)';

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly api = `${ALGORITHM_URL}/selection/ClusterCentroids`;
}

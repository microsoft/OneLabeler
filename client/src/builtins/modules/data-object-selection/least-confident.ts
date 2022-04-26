// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ALGORITHM_URL } from '@/services/http-params';
import BaseDataObjectSelectionServerModule from './utils/base';

export default class LeastConfident extends BaseDataObjectSelectionServerModule {
  readonly inputs = ['features', 'labels', 'model'];

  readonly outputs = ['queryUuids'];

  readonly id = 'DataObjectSelection-LeastConfident';

  readonly label = 'LeastConfident (Active Learning)';

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly api = `${ALGORITHM_URL}/selection/LeastConfident`;
}

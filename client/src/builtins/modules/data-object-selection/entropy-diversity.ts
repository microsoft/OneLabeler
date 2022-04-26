// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ALGORITHM_URL } from '@/services/http-params';
import BaseDataObjectSelectionServerModule from './utils/base';

export default class EntropyDiversity extends BaseDataObjectSelectionServerModule {
  readonly inputs = ['features', 'labels', 'model'];

  readonly outputs = ['queryUuids'];

  readonly id = 'DataObjectSelection-EntropyDiversity';

  readonly label = 'EntropyDiversity (Active Learning)';

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly api = `${ALGORITHM_URL}/selection/EntropyDiversity`;
}

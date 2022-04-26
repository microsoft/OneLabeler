// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ALGORITHM_URL } from '@/services/http-params';
import BaseDataObjectSelectionServerModule from './utils/base';

export default class EntropyDiversityDensity extends BaseDataObjectSelectionServerModule {
  readonly inputs = ['features', 'labels', 'model'];

  readonly outputs = ['queryUuids'];

  readonly id = 'DataObjectSelection-EntropyDiversityDensity';

  readonly label = 'EntropyDiversityDensity (Active Learning)';

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly api = `${ALGORITHM_URL}/selection/EntropyDiversityDensity`;
}

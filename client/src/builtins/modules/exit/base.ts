// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';

export default class BaseExitModule extends BaseModule {
  readonly inputs = ['labels'];

  readonly outputs = [];

  readonly id = 'Exit-Base';

  readonly label = 'Base Exit';

  readonly type = ModuleType.Exit;

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;
}

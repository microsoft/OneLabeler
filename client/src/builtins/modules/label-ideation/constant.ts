// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';

/*
enum ParamType {
  StringList = 'StringList',
  Number = 'Number',
}
*/
type RunReturn = { categories: string[] };

export default class Constant extends BaseModule {
  readonly inputs = [];

  readonly outputs = ['categories'];

  readonly id = 'Label Ideation Constant';

  readonly label = 'LabelIdeation-Constant';

  readonly type = ModuleType.DataObjectSelection;

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  /*
  params = {
    categories: {
      value: [],
      label: 'Categories',
      type: ParamType.StringList,
    },
  },
  */

  readonly run = (): RunReturn => ({
    categories: [],
  });
}

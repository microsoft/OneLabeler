// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';

/*
enum ParamType {
  StringList = 'StringList',
  Number = 'Number',
}
*/
type RunReturn = { categories: string[] };

export default {
  type: ModuleType.LabelIdeation,
  label: 'constant',
  id: 'label-ideation-constant',
  inputs: [],
  outputs: ['categories'],
  blocking: true,
  isBuiltIn: true,
  isServerless: false,
  /*
  params: {
    categories: {
      value: [],
      label: 'Categories',
      type: ParamType.StringList,
    },
  },
  */
  run: (): RunReturn => ({
    categories: [],
  }),
};

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType } from '@/commons/types';
import type {
  DataType,
  LabelTaskType,
  ParamSpecification,
} from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';
import dataTypeSetups from '@/builtins/data-types/index';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';

const dataTypeOptions = dataTypeSetups.map((d) => ({
  value: d.type,
  label: d.label,
}));
const labelTaskTypeOptions = labelTaskTypeSetups.map((d) => ({
  value: d.type,
  label: d.label,
}));

export default class BaseInitializationModule extends BaseModule {
  readonly inputs = [];

  outputs = ['dataObjects', 'labels'];

  readonly id = 'Initialization-Base';

  readonly label = 'Base Initialization';

  readonly type = ModuleType.Initialization;

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  params = {
    dataType: {
      value: null,
      label: 'Data Type',
      options: dataTypeOptions,
    },
    labelTasks: {
      value: [],
      label: 'Label Tasks',
      options: labelTaskTypeOptions,
      multiple: true,
      validate: (
        value: LabelTaskType,
        params: { dataType: ParamSpecification<DataType | null, false> },
      ): boolean => {
        const dataType = params.dataType.value;
        if (dataType === null) return true;
        const setup = dataTypeSetups.find((d) => d.type === dataType);
        const validTasks = setup?.tasks ?? [];
        return validTasks.includes(value);
      },
    },
  };
}

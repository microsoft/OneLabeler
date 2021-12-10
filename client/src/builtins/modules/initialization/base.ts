import { ModuleType } from '@/commons/types';
import type {
  DataType,
  IModule,
  LabelTaskType,
  ParamSpecification,
} from '@/commons/types';
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

export default {
  type: ModuleType.Initialization,
  label: 'Base Initialization',
  id: 'BaseInitialization',
  inputs: [],
  outputs: ['dataObjects', 'labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isServerless: true,
  params: {
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
  },
} as IModule;

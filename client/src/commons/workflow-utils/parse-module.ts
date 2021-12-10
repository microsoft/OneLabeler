import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
import type {
  ModuleParams,
  IModule,
  ModuleType,
  WorkflowNodeType,
} from '@/commons/types';
import processes from '@/builtins/modules';
import type { TrimmedNode } from './parse-node';

type MethodParam = ModuleParams[keyof ModuleParams];
type JsonModuleParams = Record<string, MethodParam | MethodParam['value']>;

export type IModuleTrimmed = Omit<
  Partial<IModule>
  & Omit<IModule, 'id' | 'type' | 'api' | 'isAlgorithmic' | 'isBuiltIn' | 'isModelBased' | 'isServerless'>,
  'run'
>;

export const parseModule = (
  moduleConfig: IModuleTrimmed,
  node: TrimmedNode,
): IModule => {
  const nodeTypeToModuleType = (type: WorkflowNodeType) => (
    type as unknown as ModuleType
  );

  // Create moduleConfig.type
  const type: ModuleType = moduleConfig.type ?? nodeTypeToModuleType(node.type);

  // The builtin moduleConfig with the same api as the current moduleConfig.
  const builtinMatch = processes.find((d) => d.id === moduleConfig.id);

  // Create moduleConfig.id
  const id: string = moduleConfig.id ?? builtinMatch?.id ?? uuidv4();

  if (builtinMatch !== undefined) {
    let params: ModuleParams | undefined;
    if (builtinMatch.params !== undefined) {
      params = cloneDeep(builtinMatch.params);
      if (moduleConfig.params !== undefined) {
        Object.keys(builtinMatch.params).forEach((paramName) => {
          const param = (moduleConfig.params as JsonModuleParams)[paramName];
          const isObject = typeof param === 'object'
            && param !== null
            && 'value' in param;
          if (!isObject) {
            (params as ModuleParams)[paramName].value = param;
          } else {
            (params as ModuleParams)[paramName] = param as MethodParam;
          }
        });
      }
    }

    return {
      ...builtinMatch,
      ...moduleConfig,
      type,
      id,
      params,
    } as IModule;
  }

  const urlRegex = /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/;

  const isAlgorithmic = moduleConfig.isAlgorithmic ?? true;
  const isBuiltIn = false;
  const isModelBased = moduleConfig.model !== undefined;
  const isServerless = moduleConfig.api !== undefined && moduleConfig.api.match(urlRegex) !== null;

  let params: ModuleParams | undefined;
  if (moduleConfig.params !== undefined) {
    params = {};
    Object.entries(moduleConfig.params).forEach(([paramName, param]) => {
      const isObject = typeof param === 'object'
        && param !== null
        && 'value' in param;
      if (!isObject) {
        (params as ModuleParams)[paramName] = {
          value: param,
          label: paramName,
          options: [{
            value: param,
            label: paramName,
          }],
        };
      } else {
        (params as ModuleParams)[paramName] = param as MethodParam;
      }
    });
  }

  return {
    ...moduleConfig,
    type,
    id,
    isAlgorithmic,
    isBuiltIn,
    isModelBased,
    isServerless,
    params,
  } as IModule;
};

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
  process: IModuleTrimmed,
  node: TrimmedNode,
): IModule => {
  const nodeTypeToModuleType = (type: WorkflowNodeType) => (
    type as unknown as ModuleType
  );

  // Create process.type
  const type: ModuleType = process.type ?? nodeTypeToModuleType(node.type);

  // The builtin process with the same api as the current process.
  const builtinMatch = processes.find((d) => d.id === process.id);

  // Create process.id
  const id: string = process.id ?? builtinMatch?.id ?? uuidv4();

  if (builtinMatch !== undefined) {
    let params: ModuleParams | undefined;
    if (builtinMatch.params !== undefined) {
      params = cloneDeep(builtinMatch.params);
      if (process.params !== undefined) {
        Object.keys(builtinMatch.params).forEach((paramName) => {
          const param = (process.params as JsonModuleParams)[paramName];
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
      ...process,
      type,
      id,
      params,
    } as IModule;
  }

  const urlRegex = /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/;

  const isAlgorithmic = process.isAlgorithmic ?? true;
  const isBuiltIn = false;
  const isModelBased = process.model !== undefined;
  const isServerless = process.api !== undefined && process.api.match(urlRegex) !== null;

  let params: ModuleParams | undefined;
  if (process.params !== undefined) {
    params = {};
    Object.entries(process.params).forEach(([paramName, param]) => {
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
    ...process,
    type,
    id,
    isAlgorithmic,
    isBuiltIn,
    isModelBased,
    isServerless,
    params,
  } as IModule;
};

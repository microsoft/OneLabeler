// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
import { WorkflowNodeType } from '@/commons/types';
import type {
  ModuleParams,
  ModuleType,
} from '@/commons/types';
import BuiltinModules from '@/builtins/modules';
import BaseDecision from '@/builtins/modules/decision/base';
import BaseExit from '@/builtins/modules/exit/base';
import BaseModule from '@/builtins/modules/base-module';
import type { TrimmedNode } from './parse-node';

type MethodParam = ModuleParams[keyof ModuleParams];
type JsonModuleParams = Record<string, MethodParam | MethodParam['value']>;

export type IModuleTrimmed = Omit<
  Partial<BaseModule>
  & Omit<BaseModule, 'id' | 'type' | 'api' | 'isBuiltIn' | 'isServerless'>,
  'run'
>;

export const parseModule = (
  moduleConfig: IModuleTrimmed | undefined,
  node: TrimmedNode,
): BaseModule => {
  const nodeTypeToModuleType = (type: WorkflowNodeType) => (
    type as unknown as ModuleType
  );

  if (moduleConfig === undefined) {
    if (node.type === WorkflowNodeType.Decision) return new BaseDecision();
    if (node.type === WorkflowNodeType.Exit) return new BaseExit();
    throw new Error('module config not given');
  }

  // Create moduleConfig.type
  const type: ModuleType = moduleConfig.type ?? nodeTypeToModuleType(node.type);
  if (moduleConfig instanceof BaseModule) return moduleConfig;

  // The builtin moduleConfig with the same api as the current moduleConfig.
  const BuiltinMatch = BuiltinModules.find((D) => {
    const d = new D();
    return (d.id === moduleConfig.id) && (d.type === moduleConfig.type);
  });
  const builtinMatchInstance = BuiltinMatch === undefined ? undefined : new BuiltinMatch();

  // Create moduleConfig.id
  const id: string = moduleConfig.id ?? builtinMatchInstance?.id ?? uuidv4();

  if (BuiltinMatch !== undefined && builtinMatchInstance !== undefined) {
    if (builtinMatchInstance.params !== undefined) {
      const params: ModuleParams = cloneDeep(builtinMatchInstance.params);
      if (moduleConfig.params !== undefined) {
        Object.keys(builtinMatchInstance.params).forEach((paramName) => {
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
      const instance = new BuiltinMatch();
      instance.params = params;
      return instance;
    }
  }

  const urlRegex = /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/;

  const isBuiltIn = false;
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

  const instance = BaseModule.fromJSON({
    ...moduleConfig,
    type,
    id,
    isBuiltIn,
    isServerless,
    params,
  });

  return instance;
};

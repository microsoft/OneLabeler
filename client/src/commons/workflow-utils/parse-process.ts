import { v4 as uuidv4 } from 'uuid';
import type {
  MethodParams,
  Process,
  ProcessType,
  WorkflowNodeType,
} from '@/commons/types';
import processes from '@/builtins/modules';
import type { TrimmedNode } from './parse-node';

type MethodParam = MethodParams[keyof MethodParams];
type JsonMethodParams = Record<string, MethodParam | MethodParam['value']>;

export type TrimmedProcess = Omit<
  Partial<Process>
  & Omit<Process, 'id' | 'type' | 'api' | 'isAlgorithmic' | 'isBuiltIn' | 'isModelBased' | 'isServerless'>,
  'run'
>;

export const parseProcess = (
  process: TrimmedProcess,
  node: TrimmedNode,
): Process => {
  const nodeTypeToProcessType = (type: WorkflowNodeType) => (
    type as unknown as ProcessType
  );

  // Create process.type
  const type: ProcessType = process.type ?? nodeTypeToProcessType(node.type);

  // The builtin process with the same api as the current process.
  const builtinMatch = processes.find((d) => d.id === process.id);

  // Create process.id
  const id: string = process.id ?? builtinMatch?.id ?? uuidv4();

  if (builtinMatch !== undefined) {
    let params: MethodParams | undefined;
    if (builtinMatch.params !== undefined) {
      // deep copy the parameters
      params = JSON.parse(JSON.stringify(builtinMatch.params));
      if (process.params !== undefined) {
        Object.keys(builtinMatch.params).forEach((paramName) => {
          const param = (process.params as JsonMethodParams)[paramName];
          const isObject = typeof param === 'object'
            && param !== null
            && 'value' in param;
          if (!isObject) {
            (params as MethodParams)[paramName].value = param;
          } else {
            (params as MethodParams)[paramName] = param as MethodParam;
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
    } as Process;
  }

  const urlRegex = /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/;

  const isAlgorithmic = process.isAlgorithmic ?? true;
  const isBuiltIn = false;
  const isModelBased = process.model !== undefined;
  const isServerless = process.api !== undefined && process.api.match(urlRegex) !== null;

  let params: MethodParams | undefined;
  if (process.params !== undefined) {
    params = {};
    Object.entries(process.params).forEach(([paramName, param]) => {
      const isObject = typeof param === 'object'
        && param !== null
        && 'value' in param;
      if (!isObject) {
        (params as MethodParams)[paramName] = {
          value: param,
          label: paramName,
          options: [{
            value: param,
            label: paramName,
          }],
        };
      } else {
        (params as MethodParams)[paramName] = param as MethodParam;
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
  } as Process;
};

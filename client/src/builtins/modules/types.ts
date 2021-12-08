import type { VueConstructor } from 'vue';
import type { DataType } from '@/builtins/data-types/types';
import type { LabelTaskType } from '@/builtins/label-task-types/types';

export enum ModuleType {
  LabelIdeation = 'LabelIdeation',
  FeatureExtraction = 'FeatureExtraction',
  DataObjectSelection = 'DataObjectSelection',
  DefaultLabeling = 'DefaultLabeling',
  InteractiveLabeling = 'InteractiveLabeling',
  StoppageAnalysis = 'StoppageAnalysis',
  ModelTraining = 'ModelTraining',
  QualityAssurance = 'QualityAssurance',
  Custom = 'Custom',
}

/** The interface of a model service. */
export interface ModelService {
  type: string;
  label: string;
  objectId: string;
  isBuiltIn: boolean;
  isServerless: boolean;
  isValidSampler: boolean;
  // id: string;
  // api: string;
  // isLocal: boolean;
}

export type MethodParams = Record<string, {
  value: unknown,
  label: string,
  options: { value: unknown, label: string }[],
}>;

/** The data labeling process class. */
export interface Process {
  label: string;
  id: string;
  type: ModuleType;
  inputs: string[];
  outputs: string[];
  // For serverless methods, the api is the method's unique key.
  api?: string;

  // The properties of the module.
  isAlgorithmic: boolean;
  isBuiltIn: boolean;
  isModelBased: boolean;
  isServerless: boolean;
  // The restriction on data types that the process can handle.
  // If not given, the process is regarded agnostic of data types.
  dataTypes?: DataType[];
  // The restriction on label tasks that the process can handle.
  // If not given, the process is regarded agnostic of label tasks.
  labelTasks?: LabelTaskType[];

  model?: ModelService;
  params?: MethodParams;

  /** The implementation of algorithm module. */
  run?: (inputs: Record<string, unknown>) => Promise<void | Record<string, unknown>>;

  /** The implementation of interface module. */
  render?: VueConstructor;
}

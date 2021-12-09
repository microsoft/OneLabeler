import type { VueConstructor } from 'vue';
import type { DataType } from '@/builtins/data-types/types';
import type { LabelTaskType } from '@/builtins/label-task-types/types';

export enum ModuleType {
  Initialization = 'Initialization',
  LabelIdeation = 'LabelIdeation',
  FeatureExtraction = 'FeatureExtraction',
  DataObjectSelection = 'DataObjectSelection',
  DefaultLabeling = 'DefaultLabeling',
  InteractiveLabeling = 'InteractiveLabeling',
  StoppageAnalysis = 'StoppageAnalysis',
  ModelTraining = 'ModelTraining',
  QualityAssurance = 'QualityAssurance',
  Base = 'Base',
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

export type ParamSpecification<T, M extends boolean = false> = {
  /** The single or multiple selected value(s) of the parameter. */
  value: M extends true ? T[] : T;
  /** The name of the parameter that appears in the interface. */
  label: string;
  /** The possible options of the parameter. */
  options: { value: T, label: string }[];
  /** Whether the parameter options can be multi-selected. */
  multiple?: M,
  /** Check if a value option is validate given all the parameter values. */
  validate?: (
    value: T,
    params: Record<string, ParamSpecification<unknown>>,
  ) => boolean,
};

export type ModuleParams = Record<string, ParamSpecification<unknown>>;

/** The data labeling process class. */
export interface IModule {
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
  params?: ModuleParams;

  // Note: initialization node do not need run or render

  /** The implementation of algorithm module. */
  run?: (inputs: Record<string, unknown>) => Promise<void | Record<string, unknown>>;

  /**
   * The implementation of interface module.
   *
   * @note Make render store a component accessor instead of a component itself.
   * Otherwise vue keeps raising warnings possibly because the module is frequently
   * copied, and copying the vue component causes errors.
   */
  render?: () => VueConstructor;
}

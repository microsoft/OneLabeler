import type { VueConstructor } from 'vue';
import type { DataType } from '@/builtins/data-types/types';
import type { LabelTaskType } from '@/builtins/label-task-types/types';

export enum ModuleType {
  Initialization = 'Initialization',
  Decision = 'Decision',
  Exit = 'Exit',
  Base = 'Base',
  LabelIdeation = 'LabelIdeation',
  FeatureExtraction = 'FeatureExtraction',
  DataObjectSelection = 'DataObjectSelection',
  DefaultLabeling = 'DefaultLabeling',
  InteractiveLabeling = 'InteractiveLabeling',
  StoppageAnalysis = 'StoppageAnalysis',
  ModelTraining = 'ModelTraining',
  QualityAssurance = 'QualityAssurance',
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

export type ParamSpecification<T, M extends boolean> = {
  /** The single or multiple selected value(s) of the parameter. */
  value: (M extends true ? T[] : T) | null;
  /** The name of the parameter that appears in the interface. */
  label: string;
  /** The possible options of the parameter. */
  options: { value: T, label: string }[];
  /** Whether the parameter options can be multi-selected. */
  multiple?: M,
  /** Check if a value option is validate given all the parameter values. */
  validate?: (
    value: T,
    params: any,
  ) => boolean,
};

export type ModuleParams = Record<string, ParamSpecification<unknown, boolean>>;

export type StateNames = 'dataObjects' | 'labels' | 'queryUuids' | 'features' | 'model' | 'stop';

/** The data labeling process class. */
export interface IModule {
  inputs: string[];
  outputs: string[];
  id: string;
  label: string;
  type: ModuleType;

  // The properties of the module.
  isAlgorithmic: boolean;
  isBuiltIn: boolean;
  isServerless: boolean;
  // The restriction on data types that the process can handle.
  // If not given, the process is regarded agnostic of data types.
  dataTypes?: DataType[];
  // The restriction on label tasks that the process can handle.
  // If not given, the process is regarded agnostic of label tasks.
  labelTasks?: LabelTaskType[];

  // For serverless methods, the api is the method's unique key.
  api?: string;
  model?: ModelService;
  params?: ModuleParams;

  // Note: initialization node do not need run or render

  /** The implementation of algorithm module. */
  run?: (inputs: Record<StateNames, unknown>) => Promise<void | Record<string, unknown>> | boolean;

  /**
   * The implementation of interface module.
   *
   * @note Make render store a component accessor instead of a component itself.
   * Otherwise vue keeps raising warnings possibly because the module is frequently
   * copied, and copying the vue component causes errors.
   */
  render?: () => VueConstructor;
}

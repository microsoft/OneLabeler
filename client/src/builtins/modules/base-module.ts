/* eslint-disable max-classes-per-file */
import type { VueConstructor } from 'vue';
import {
  DataType,
  LabelTaskType,
  ModuleType,
  StateNames,
} from '@/commons/types';

type PartialRecord<K extends string, T> = Partial<Record<K, T>>

type MaybePromise<T> = T | Promise<T>

export abstract class AbstractBaseModule {
  /** Input states. */
  abstract inputs: string[];

  /** Output states. */
  abstract outputs: string[];

  /**
   * The unique id of the class.
   * Used for matching the class constructor
   * when configuring the module with JSON.
   */
  static readonly id: string;

  /** The name of the class that appears in the interface. */
  static label: string;

  static type: ModuleType;

  static blocking: boolean;

  abstract readonly run?: (
    inputs: Record<StateNames, unknown>,
  ) => MaybePromise<void | PartialRecord<StateNames, unknown>> | boolean;

  abstract readonly render?: () => VueConstructor;
}

export type ParamSpecification<T> = {
  value: T;
  label: string;
  options: { value: T, label: string }[];
};
export type ParamOptions = Record<string, unknown>;

export default class BaseModule implements AbstractBaseModule {
  inputs: string[] = [];

  outputs: string[] = [];

  id = '';

  api?: string;

  type: ModuleType = ModuleType.Base;

  /** The data types the module applies to. */
  dataTypes?: DataType[];

  /** The label task types the module applies to. */
  labelTaskTypes?: LabelTaskType[];

  blocking?: boolean;

  /** The hyper parameters of the module instances. */
  params: Record<string, ParamSpecification<unknown>> = {};

  /** The implementation of algorithm module. */
  /*
  run?: (
    inputs: Partial<Record<StateNames, unknown>>,
  ) => MaybePromise<void | PartialRecord<StateNames, unknown>> | boolean;
  */

  /**
   * The implementation of interface module.
   *
   * @note Make render store a component accessor instead of a component itself.
   * Otherwise vue keeps raising warnings possibly because the module is frequently
   * copied, and copying the vue component causes errors.
   */
  readonly render?: () => VueConstructor;

  constructor(paramOptions?: Partial<ParamOptions>) {
    if (paramOptions === undefined) return;
    this.storeOptions(paramOptions);
  }

  /** Deep clone the current module instance. */
  clone(): this {
    const ret: this = Object.create(this.constructor.prototype);
    Object.assign(ret, this);
    return ret;
  }

  /** Upsert attributes to the current module instance. */
  upsert(partial: Partial<typeof this>): this {
    Object.assign(this, partial);
    return this;
  }

  /** Store the chosen hyper parameter values. */
  storeOptions(paramOptions: Partial<ParamOptions>): this {
    console.log('store options this', this);
    let { params } = this;
    console.log('old params', params);
    Object.entries(paramOptions).forEach(([key, entry]) => {
      params = {
        ...params,
        [key]: {
          ...(params[key]),
          value: entry,
        },
      };
    });
    console.log('new params', params);
    this.params = params;
    console.log('this params', this.params);
    return this;
  }

  /** Create a module instance from JSON configuration. */
  static fromJSON(config: Record<string, unknown>): BaseModule {
    const instance = new this();
    Object.assign(instance, config);
    return instance;
  }
}

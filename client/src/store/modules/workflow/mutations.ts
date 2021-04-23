import {
  DataType,
  LabelTaskType,
  ModelService,
  Process,
  WorkflowNode,
  WorkflowEdge,
} from '@/commons/types';
import { IState } from './state';
import * as types from './mutation-types';

export default {
  [types.SET_NODES](
    state: IState,
    nodes: WorkflowNode[],
  ): void {
    state.nodes = nodes;
  },
  [types.SET_EDGES](
    state: IState,
    edges: WorkflowEdge[],
  ): void {
    state.edges = edges;
  },
  [types.SET_DATA_TYPE](
    state: IState,
    dataType: DataType,
  ): void {
    state.dataType = dataType;
  },
  [types.SET_LABEL_TASKS](
    state: IState,
    labelTasks: LabelTaskType[],
  ): void {
    state.labelTasks = labelTasks;
  },
  [types.SET_MODEL_SERVICES](
    state: IState,
    services: ModelService[],
  ): void {
    state.modelServices = services;
  },
  [types.SET_PROCESSES](
    state: IState,
    processes: Process[],
  ): void {
    state.processes = processes;
  },
};

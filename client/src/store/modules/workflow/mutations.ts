// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type {
  ModelService,
  IModule,
  WorkflowNode,
  WorkflowEdge,
} from '@/commons/types';
import type { IState } from './state';
import * as types from './mutation-types';

export default {
  [types.SET_CURRENT_NODE](
    state: IState,
    node: WorkflowNode,
  ): void {
    state.currentNode = node;
  },
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
  [types.SET_MODEL_SERVICES](
    state: IState,
    services: ModelService[],
  ): void {
    state.modelServices = services;
  },
  [types.SET_MODULES](
    state: IState,
    processes: IModule[],
  ): void {
    state.processes = processes;
  },
};

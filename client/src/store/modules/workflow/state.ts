import {
  DataType,
  LabelTaskType,
  ModelService,
  Process,
  WorkflowNode,
  WorkflowEdge,
} from '@/commons/types';
import { modelServices, processes } from '@/commons/builtins';
// import graph from '@/commons/graph-template';
import graph from '@/commons/graph-template-simple';

export interface IState {
  /** The node currently being processed. */
  currentNode: WorkflowNode | null;
  /** The nodes in the workflow graph. */
  nodes: WorkflowNode[],
  /** The edges in the workflow graph. */
  edges: WorkflowEdge[],
  /** The concerned data object type. */
  dataType: DataType,
  /** The concerned data labeling tasks. */
  labelTasks: LabelTaskType[],
  /** The collection of model services. */
  modelServices: ModelService[],
  /** The collection of data labeling processes. */
  processes: Process[],
}

export const createInitialState = (): IState => ({
  currentNode: null,
  nodes: graph.nodes,
  edges: graph.edges,
  dataType: DataType.Image,
  labelTasks: [], // [LabelTaskType.Classification],
  modelServices,
  processes,
});

export default createInitialState();

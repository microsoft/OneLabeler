import {
  ModelService,
  Process,
  WorkflowNode,
  WorkflowEdge,
  WorkflowGraph,
} from '@/commons/types';
import modelServices from '@/builtins/model-services';
import processes from '@/builtins/processes';

const DEFAULT_WORKFLOW = process.env.VUE_APP_DEFAULT_WORKFLOW;
const { nodes, edges } = DEFAULT_WORKFLOW !== undefined
  ? JSON.parse(DEFAULT_WORKFLOW) as WorkflowGraph
  : { nodes: [], edges: [] };

export interface IState {
  /** The node currently being processed. */
  currentNode: WorkflowNode | null;
  /** The nodes in the workflow graph. */
  nodes: WorkflowNode[];
  /** The edges in the workflow graph. */
  edges: WorkflowEdge[];
  /** The collection of model services. */
  modelServices: ModelService[];
  /** The collection of data labeling processes. */
  processes: Process[];
}

export const createInitialState = (): IState => ({
  currentNode: null,
  nodes,
  edges,
  modelServices,
  processes,
});

export default createInitialState();

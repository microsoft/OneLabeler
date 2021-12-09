import type {
  ModelService,
  IModule,
  WorkflowNode,
  WorkflowEdge,
} from '@/commons/types';
import modelServices from '@/builtins/model-services';
import processes from '@/builtins/modules';
import { TrimmedWorkflow, parseWorkflow } from '@/commons/workflow-utils';

const DEFAULT_WORKFLOW = process.env.VUE_APP_DEFAULT_WORKFLOW;
const { nodes, edges } = DEFAULT_WORKFLOW !== undefined
  ? parseWorkflow(JSON.parse(DEFAULT_WORKFLOW) as TrimmedWorkflow)
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
  processes: IModule[];
}

export const createInitialState = (): IState => ({
  currentNode: null,
  nodes,
  edges,
  modelServices,
  processes,
});

export default createInitialState();

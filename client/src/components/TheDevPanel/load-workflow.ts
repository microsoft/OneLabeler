import Ajv, { JSONSchemaType } from 'ajv';
import { v4 as uuidv4 } from 'uuid';
import {
  InitializationParams,
  MethodParams,
  ModelService,
  PortDirection,
  Process,
  ProcessType,
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import {
  parseNodeLayout,
  parseEdgeLayout,
} from '@/commons/workflow-scaffold';
import processes from '@/builtins/processes';

type MethodParam = MethodParams[keyof MethodParams];
type JsonMethodParams = Record<string, MethodParam | MethodParam['value']>;

type JsonProcess = {
  label: string;
  inputs: string[];
  api: string;
  type?: ProcessType;
  id?: string;
  isAlgorithmic?: boolean;
  isBuiltIn?: boolean;
  isModelBased?: boolean;
  isServerless?: boolean;
  model?: ModelService;
  params?: JsonMethodParams;
}

type JsonNode = {
  label: string;
  type: WorkflowNodeType;
  id?: string;
  value?: WorkflowNode['value'];
  layout?: WorkflowNode['layout'];
}

type JsonEdge = {
  source: string;
  target: string;
  id?: string;
  condition?: boolean;
  layout?: WorkflowEdge['layout'];
}

export type JsonGraph = {
  nodes: JsonNode[];
  edges: JsonEdge[];
}

const ajv = new Ajv({
  allowUnionTypes: true,
});
const schema: JSONSchemaType<JsonGraph> = {
  definitions: {
    node: {
      type: 'object',
      required: ['label', 'type'],
      properties: {
        label: { type: 'string' },
        type: { type: 'string' },
        id: { type: 'string', nullable: true },
        value: {
          type: ['object', 'array'],
          nullable: true,
        },
        layout: {
          type: 'object',
          nullable: true,
          required: ['x', 'y', 'width', 'height'],
          properties: {
            x: { type: 'number' },
            y: { type: 'number' },
            width: { type: 'number' },
            height: { type: 'number' },
          },
        },
      },
    },
    edge: {
      type: 'object',
      required: ['source', 'target'],
      properties: {
        source: { type: 'string' },
        target: { type: 'string' },
        id: { type: 'string', nullable: true },
        condition: { type: 'boolean', nullable: true },
        layout: {
          type: 'object',
          nullable: true,
          required: ['source', 'target'],
          properties: {
            source: {
              type: 'object',
              required: ['direction', 'dx', 'dy'],
              properties: {
                direction: { type: 'string' },
                dx: { type: 'number' },
                dy: { type: 'number' },
              },
            },
            target: {
              type: 'object',
              required: ['direction', 'dx', 'dy'],
              properties: {
                direction: { type: 'string' },
                dx: { type: 'number' },
                dy: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },
  type: 'object',
  required: ['nodes', 'edges'],
  properties: {
    nodes: {
      type: 'array',
      items: {
        type: 'object',
        required: ['label', 'type'],
        $ref: '#/definitions/node',
      },
    },
    edges: {
      type: 'array',
      items: {
        type: 'object',
        required: ['source', 'target'],
        $ref: '#/definitions/edge',
      },
    },
  },
  additionalProperties: false,
};

/** Validate the schema of the json. */
export const validate = ajv.compile(schema);

const parseProcess = (
  process: JsonProcess,
  node: JsonNode,
): Process => {
  const nodeTypeToProcessType = (type: WorkflowNodeType) => (
    type as unknown as ProcessType
  );

  // Create process.type
  const type = process.type !== undefined
    ? process.type
    : nodeTypeToProcessType(node.type);

  // The builtin process with the same api as the current process.
  const builtinMatch = processes.find((d) => d.api === process.api);

  // Create process.id
  let id: string;
  if (process.id !== undefined) {
    id = process.id;
  } else if (builtinMatch !== undefined) {
    id = builtinMatch.id;
  } else {
    id = uuidv4();
  }

  if (builtinMatch !== undefined) {
    const isAlgorithmic = process.isAlgorithmic !== undefined
      ? process.isAlgorithmic
      : builtinMatch.isAlgorithmic;
    const isBuiltIn = process.isBuiltIn !== undefined
      ? process.isBuiltIn
      : builtinMatch.isBuiltIn;
    const isModelBased = process.isModelBased !== undefined
      ? process.isModelBased
      : builtinMatch.isModelBased;
    const isServerless = process.isServerless !== undefined
      ? process.isServerless
      : builtinMatch.isServerless;

    let params: MethodParams | undefined;
    if (builtinMatch.params !== undefined) {
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
      ...process,
      type,
      id,
      isAlgorithmic,
      isBuiltIn,
      isModelBased,
      isServerless,
      params,
    } as Process;
  }

  const urlRegex = /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/;

  const isAlgorithmic = process.isAlgorithmic !== undefined
    ? process.isAlgorithmic
    : true;
  const isBuiltIn = false;
  const isModelBased = process.model !== undefined;
  const isServerless = process.api.match(urlRegex) !== null;

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

const parseNodeValue = (
  value: JsonNode['value'],
  node: JsonNode,
): WorkflowNode['value'] => {
  // Decision and exit nodes have no value attributes.
  if (
    node.type === WorkflowNodeType.Decision
    || node.type === WorkflowNodeType.Exit
  ) return undefined;

  // If value is not passed, return empty setting of the value.
  if (value === undefined) {
    if (node.type === WorkflowNodeType.Initialization) {
      return {
        dataType: null,
        labelTasks: [],
      } as InitializationParams;
    }
    if (node.type === WorkflowNodeType.DataObjectSelection
      || node.type === WorkflowNodeType.InteractiveLabeling
    ) {
      return [];
    }
    return null;
  }

  if (node.type === WorkflowNodeType.Initialization) {
    return value as InitializationParams;
  }

  // If value is passed
  if (Array.isArray(value)) {
    return value.map((d: JsonProcess) => parseProcess(d, node));
  }
  return parseProcess(value as JsonProcess, node);
};

const parseNode = (node: JsonNode, idx: number): WorkflowNode => {
  // Use node.label as node.id if id doesn't exist.
  const id = node.id !== undefined ? node.id : node.label;

  // Create node.layout if layout doesn't exist.
  const layout = parseNodeLayout(node.layout, node.type, idx);

  // Edit node.value
  const value = parseNodeValue(node.value, node);

  return {
    ...node,
    id,
    layout,
    value,
  };
};

const parseEdge = (edge: JsonEdge, nodes: WorkflowNode[]): WorkflowEdge => {
  // Create edge.id if id doesn't exist.
  const id = edge.id !== undefined ? edge.id : uuidv4();

  // Create edge.layout if layout doesn't exist.
  let { layout } = edge;
  if (layout === undefined) {
    const sourceNode = nodes.find((d) => d.id === edge.source) as WorkflowNode;
    const targetNode = nodes.find((d) => d.id === edge.target) as WorkflowNode;
    layout = parseEdgeLayout(layout, sourceNode, targetNode);
  }
  return { ...edge, id, layout };
};

/** Parse the workflow stored in json into the desired data structure. */
export const JsonGraphToWorkflowGraph = (graph: JsonGraph): WorkflowGraph => {
  const parsedNodes = graph.nodes
    .map((node: JsonNode, i) => parseNode(node, i));
  const parsedEdges = graph.edges
    .map((edge: JsonEdge) => parseEdge(edge, parsedNodes));
  return {
    nodes: parsedNodes,
    edges: parsedEdges,
  };
};

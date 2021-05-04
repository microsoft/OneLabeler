import Ajv, { JSONSchemaType } from 'ajv';
import { v4 as uuidv4 } from 'uuid';
import {
  PortDirection,
  WorkflowGraph,
  WorkflowNode,
} from '@/commons/types';

const ajv = new Ajv({
  allowUnionTypes: true,
});
const schema: JSONSchemaType<Partial<WorkflowGraph>> = {
  type: 'object',
  properties: {
    nodes: {
      type: 'array',
      items: {
        type: 'object',
        required: ['label', 'type'],
        properties: {
          label: { type: 'string' },
          id: { type: 'string' },
          type: { type: 'string' },
          value: { type: ['object', 'array'] },
          x: { type: 'number' },
          y: { type: 'number' },
        },
      },
    },
    edges: {
      type: 'array',
      items: {
        type: 'object',
        required: ['source', 'target'],
        properties: {
          id: { type: 'string' },
          source: { type: 'string' },
          target: { type: 'string' },
          x1: { type: 'number' },
          y1: { type: 'number' },
          x2: { type: 'number' },
          y2: { type: 'number' },
        },
      },
    },
  },
  additionalProperties: false,
};

type JsonMethodParams = Record<string, unknown | {
  value: unknown,
  label: string,
  options: { value: unknown, text: string }[],
}>;

type JsonProcess = {
  label: string;
  inputs: string[];
  api: string;
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
  value?: JsonProcess
    | JsonProcess[]
    | InitializationParams;
  layout?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
}

type JsonEdge = {
  source: string;
  target: string;
  id?: string;
  condition?: boolean;
  layout?: {
    source?: {
      direction?: PortDirection,
      dx?: number;
      dy?: number;
    },
    target?: {
      direction?: PortDirection,
      dx?: number;
      dy?: number;
    }
  };
}

type JsonGraph = {
  nodes: JsonNode[];
  edges: JsonEdge[];
}

/** Validate the schema of the json. */
export const validate = ajv.compile(schema);

/** Parse the workflow stored in json into the desired data structure. */
export const JsonGraphToWorkflowGraph = (graph: JsonGraph): WorkflowGraph => {
  const DEFAULT_NODE_WIDTH = 60;
  const DEFAULT_NODE_HEIGHT = 60;
  const DEFAULT_CANVAS_WIDTH = 600;
  const DEFAULT_MARGIN = 40;
  const DEFAULT_NODES_PER_ROW = Math.floor((DEFAULT_CANVAS_WIDTH - DEFAULT_MARGIN)
    / (DEFAULT_NODE_WIDTH + DEFAULT_MARGIN));

  const getAngle = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const radian = Math.atan2(dy, dx);
    const degree = (180 * radian) / Math.PI;
    return (360 + Math.round(degree)) % 360;
  };

  const parsedGraph = { ...graph };

  parsedGraph.nodes = parsedGraph.nodes
    .map((node, i) => {
      // Use node.label as node.id if id doesn't exist.
      const id = 'id' in node ? node.id : node.label;

      // Create node.layout if layout doesn't exist.
      let { layout } = node;
      if (layout === undefined) {
        const rowIdx = Math.floor(i / DEFAULT_NODES_PER_ROW);
        const columnIdx = i - DEFAULT_NODES_PER_ROW * rowIdx;
        layout = {
          x: columnIdx * DEFAULT_NODE_WIDTH + (columnIdx + 1) * DEFAULT_MARGIN,
          y: rowIdx * DEFAULT_NODE_HEIGHT + (rowIdx + 1) * DEFAULT_MARGIN,
          width: DEFAULT_NODE_WIDTH,
          height: DEFAULT_NODE_HEIGHT,
        };
      }
      return { ...node, id, layout };
    });

  // Parse node.value.

  parsedGraph.edges = parsedGraph.edges
    .map((edge) => {
      // Create edge.id if id doesn't exist.
      const id = 'id' in edge ? edge.id : uuidv4();

      // Create edge.layout if layout doesn't exist.
      let { layout } = edge;
      if (layout === undefined) {
        const nodes = parsedGraph.nodes as WorkflowNode[];
        const sourceNode = nodes.find((d) => d.id === edge.source);
        const targetNode = nodes.find((d) => d.id === edge.target);
        if (sourceNode !== undefined && targetNode !== undefined) {
          const x1 = sourceNode.layout.x;
          const y1 = sourceNode.layout.y;
          const x2 = targetNode.layout.x;
          const y2 = targetNode.layout.y;
          const angle = getAngle(x1, -y1, x2, -y2);
          if (angle <= 45 || angle > 315) {
            layout = {
              source: {
                direction: PortDirection.Right,
                dx: sourceNode.layout.width,
                dy: sourceNode.layout.height / 2,
              },
              target: {
                direction: PortDirection.Left,
                dx: 0,
                dy: targetNode.layout.height / 2,
              },
            };
          } else if (angle <= 135 && angle > 45) {
            layout = {
              source: {
                direction: PortDirection.Top,
                dx: sourceNode.layout.width / 2,
                dy: 0,
              },
              target: {
                direction: PortDirection.Bottom,
                dx: targetNode.layout.width / 2,
                dy: targetNode.layout.height,
              },
            };
          } else if (angle <= 225 && angle >= 135) {
            layout = {
              source: {
                direction: PortDirection.Left,
                dx: 0,
                dy: sourceNode.layout.height / 2,
              },
              target: {
                direction: PortDirection.Right,
                dx: targetNode.layout.width,
                dy: targetNode.layout.height / 2,
              },
            };
          } else if (angle <= 315 && angle > 225) {
            layout = {
              source: {
                direction: PortDirection.Bottom,
                dx: sourceNode.layout.width / 2,
                dy: sourceNode.layout.height,
              },
              target: {
                direction: PortDirection.Top,
                dx: sourceNode.layout.width / 2,
                dy: 0,
              },
            };
          }
        }
      }
      return { ...edge, id, layout };
    });

  return parsedGraph;
};

import Ajv, { JSONSchemaType } from 'ajv';
import { TrimmedWorkflow } from './parse-workflow';

const ajv = new Ajv({ allowUnionTypes: true });

const schema: JSONSchemaType<TrimmedWorkflow> = {
  definitions: {
    node: {
      type: 'object',
      required: ['label', 'type'],
      properties: {
        id: { type: 'string', nullable: true },
        label: { type: 'string' },
        type: { type: 'string' },
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
    label: { type: 'string', nullable: true },
  },
  additionalProperties: false,
};

/** Validate the schema of the json. */
const validate = ajv.compile(schema);

export default validate;

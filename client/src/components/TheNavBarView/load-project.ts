import Ajv, { JSONSchemaType } from 'ajv';
import {
  Category,
  IDataObject,
  ILabel,
  IStatus,
} from '@/commons/types';

export type ProjectData = {
  dataObjects: IDataObject[];
  labels: ILabel[];
  statuses: IStatus[];
  classes: Category[];
  categoryTasks: Record<Category, LabelTaskType[] | null>,
  unlabeledMark: Category;
  featureNames?: string[];
}

const ajv = new Ajv();
const schema: JSONSchemaType<ProjectData> = {
  definitions: {
    dataObject: {
      type: 'object',
      required: ['uuid'],
      properties: {
        uuid: { type: 'string' },
        features: {
          type: 'array',
          nullable: true,
          items: { type: 'number' },
        },
      },
      additionalProperties: true,
    },
    point: {
      type: 'array',
      items: { type: 'number' },
      minItems: 2,
      maxItems: 2,
    },
    labelShape: {
      type: 'object',
      required: [
        'category',
        'shape',
        'position',
      ],
      properties: {
        label: { type: 'string' },
        shape: { type: 'string' },
        uuid: { type: 'string', nullable: true },
      },
      additionalProperties: true,
    },
    labelMask: {
      type: 'object',
      required: ['path'],
      properties: {
        content: { type: 'string', nullable: true },
        width: { type: 'number', nullable: true },
        height: { type: 'number', nullable: true },
      },
      additionalProperties: true,
    },
    status: {
      type: 'object',
      required: ['uuid', 'value'],
      properties: {
        uuid: { type: 'string' },
        value: { type: 'string' },
      },
    },
    categoryTasks: {
      type: 'object',
      // TODO: complete the specification for categoryTasks
    },
  },
  type: 'object',
  required: [
    'dataObjects',
    'statuses',
    'classes',
    'unlabeledMark',
  ],
  properties: {
    dataObjects: {
      type: 'array',
      items: {
        type: 'object',
        required: ['uuid'],
        $ref: '#/definitions/dataObject',
      },
    },
    labels: {
      type: 'array',
      items: {
        type: 'object',
        required: ['uuid'],
        properties: {
          uuid: { type: 'string' },
          category: { type: 'string', nullable: true },
          shapes: {
            $ref: '#/definitions/labelShape',
            type: 'array',
            nullable: true,
          },
          mask: {
            $ref: '#/definitions/labelMask',
            type: 'array',
            nullable: true,
          },
        },
        additionalProperties: true,
      },
    },
    statuses: {
      type: 'array',
      items: {
        type: 'object',
        required: ['uuid', 'value'],
        $ref: '#/definitions/status',
      },
    },
    classes: {
      type: 'array',
      items: { type: 'string' },
    },
    unlabeledMark: { type: 'string' },
    featureNames: {
      type: 'array',
      nullable: true,
      items: { type: 'string' },
    },
  },
  additionalProperties: false,
};

/** Validate the schema of the json. */
export const validate = ajv.compile(schema);

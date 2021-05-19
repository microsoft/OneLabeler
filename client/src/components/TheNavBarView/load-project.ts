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
  unlabeledMark: Category;
  featureNames?: string[];
}

const ajv = new Ajv();
const schema: JSONSchemaType<ProjectData> = {
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
        required: [
          'uuid',
        ],
        properties: {
          uuid: { type: 'string' },
          features: {
            type: 'array',
            items: { type: 'number' },
          },
        },
        additionalProperties: true,
      },
    },
    labels: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'uuid',
        ],
        properties: {
          uuid: { type: 'string' },
          category: { type: 'string' },
          shapes: {
            type: 'array',
            items: {
              type: 'object',
              required: [
                'category',
                'shape',
                'position',
              ],
              properties: {
                label: { type: 'string' },
                shape: { type: 'string' },
                position: { type: 'array' },
              },
              additionalProperties: true,
            },
          },
          mask: {
            type: 'object',
            required: [
              'path',
            ],
            properties: {
              path: { type: ['string', 'null'] },
            },
            additionalProperties: true,
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
        properties: {
          uuid: { type: ['string'] },
          value: { type: ['string'] },
        },
      },
    },
    classes: {
      type: 'array',
      items: { type: 'string' },
    },
    unlabeledMark: { type: 'string' },
    featureNames: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  additionalProperties: false,
};

/** Validate the schema of the json. */
export const validate = ajv.compile(schema);

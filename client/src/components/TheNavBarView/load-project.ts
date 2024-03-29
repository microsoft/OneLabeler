// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Ajv, { JSONSchemaType } from 'ajv';
import type {
  Category,
  IDataObject,
  ILabel,
  IStatus,
  LabelTaskType,
} from '@/commons/types';

export type ProjectData = {
  dataObjects: IDataObject[];
  labels: Pick<ILabel, 'uuid'>[];
  statuses: IStatus[];
  categories: Category[];
  categoryTasks: Partial<Record<Category, LabelTaskType[] | null>>,
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
    label: {
      type: 'object',
      required: ['uuid'],
      properties: {
        uuid: { type: 'string' },
      },
      additionalProperties: true,
    },
    status: {
      type: 'object',
      required: ['uuid', 'value'],
      properties: {
        uuid: {
          description: 'The uuid of the data object that owns the label status.',
          type: 'string',
        },
        value: {
          $ref: '#/definitions/statusType',
          description: 'The label status value.',
        },
      },
    },
    statusType: {
      description: 'The enum of label status types.',
      enum: [
        'Labeled',
        'New',
        'Skipped',
        'Viewed',
      ],
      type: 'string',
    },
  },
  type: 'object',
  required: [
    'categories',
    'categoryTasks',
    'dataObjects',
    'labels',
    'statuses',
    'unlabeledMark',
  ],
  properties: {
    categories: {
      type: 'array',
      items: { type: 'string' },
    },
    categoryTasks: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        nullable: true,
        items: { type: 'string' },
      },
    },
    dataObjects: {
      type: 'array',
      items: {
        type: 'object',
        required: ['uuid'],
        $ref: '#/definitions/dataObject',
      },
    },
    featureNames: {
      type: 'array',
      nullable: true,
      items: { type: 'string' },
    },
    labels: {
      type: 'array',
      items: {
        type: 'object',
        required: ['uuid'],
        $ref: '#/definitions/label',
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
    unlabeledMark: {
      description: 'The label category.',
      type: 'string',
    },
  },
  additionalProperties: false,
};

/** Validate the schema of the json. */
export const validate = ajv.compile(schema);

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuidv4 } from 'uuid';
import * as hdf5 from 'jsfive';
import {
  DataType,
  LabelTaskType,
  UploadTarget,
} from '@/commons/types';
import type {
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  ILabel,
  IPointCloud,
  Vector3d,
} from '@/commons/types';
import BaseDisplay from './BaseDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

/** Reshape 1d array to 2d array with the given width. */
const toMatrix = <T>(arr: T[], width: number) => arr.reduce(
  (rows: T[][], entry: T, index: number) => {
    if (index % width === 0) {
      rows.push([entry]);
    } else {
      rows[rows.length - 1].push(entry);
    }
    return rows;
  }, [],
);

export default {
  type: DataType.PointCloud,
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.MultiLabelClassification,
    LabelTaskType.FreeformText,
    LabelTaskType.Segmentation3d,
  ],
  label: 'point cloud',
  importType: UploadTarget.File,
  handleImport: async (
    file: File,
    storage: IDataObjectStorage,
  ): Promise<void> => {
    await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = (evt) => {
        if (evt.target === null) return;
        const buffer = evt.target.result as ArrayBuffer;
        const f = new hdf5.File(buffer, '');
        const data = f.get('data');
        const { shape, value } = data;

        const [nDataObjects, nPoints, nDims] = shape;
        const length = nPoints * nDims;
        for (let i = 0; i < nDataObjects; i += 1) {
          const slice = value.slice(length * i, length * i + length);
          const dataObject: IPointCloud = {
            uuid: uuidv4(),
            content: toMatrix(slice, nDims) as Vector3d[],
          };
          storage.upsert(dataObject);
        }
        resolve(storage);
      };
      reader.readAsArrayBuffer(file);
    });
  },
  handleExport: <T extends IDataObject>(
    dataObjects: T[],
    labels: ILabel[],
  ): IExport<T> => {
    const uuid2idxInLabels = Object.fromEntries(
      labels.map((d, i) => [d.uuid, i]),
    );
    return dataObjects.map((d) => {
      const partial = {
        uuid: d.uuid,
        content: d.content,
      };
      const idx = uuid2idxInLabels[d.uuid];
      return idx === undefined ? partial : { ...labels[idx], ...partial };
    });
  },
  display: BaseDisplay,
} as IDataTypeSetup<UploadTarget.File>;

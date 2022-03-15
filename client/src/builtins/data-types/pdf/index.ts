// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuidv4 } from 'uuid';
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
  IPdf,
} from '@/commons/types';
import BaseDisplay from './BaseDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

export default {
  type: DataType.PDF,
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.MultiLabelClassification,
    LabelTaskType.FreeformText,
  ],
  label: 'pdf',
  importType: UploadTarget.Folder,
  handleImport: async (
    files: FileList,
    storage: IDataObjectStorage,
  ): Promise<void> => {
    await Promise.all([...files].map(async (file) => new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const url = reader.result as string;
        const dataObject: IPdf = {
          uuid: uuidv4(),
          content: url,
        };
        await storage.upsert(dataObject);
        resolve();
      };
      reader.readAsDataURL(file);
    })));
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
} as IDataTypeSetup<UploadTarget.Folder>;

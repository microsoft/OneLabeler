// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuidv4 } from 'uuid';
import {
  DataType,
  LabelTaskType,
  UploadTarget,
} from '@/commons/types';
import type {
  IDataObjectStorage,
  IDataTypeSetup,
  IImage,
  ILabel,
} from '@/commons/types';
import { getImgSize } from '@/commons/utils';
import { getBase64 } from '@/plugins/file';
import BaseDisplay from './BaseDisplay.vue';

type IExport = Partial<ILabel>[];

export default {
  type: DataType.Image,
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.MultiLabelClassification,
    LabelTaskType.FreeformText,
    LabelTaskType.ObjectDetection,
    LabelTaskType.Segmentation2d,
  ],
  label: 'image',
  importType: UploadTarget.Folder,
  handleImport: async (
    files: FileList,
    storage: IDataObjectStorage,
  ): Promise<void> => {
    await Promise.all([...files].map(async (file) => {
      const filename = file.name;
      const content = await getBase64(file);
      const { width, height } = await getImgSize(content);
      const dataObject: IImage = {
        uuid: uuidv4(),
        content,
        width,
        height,
        filename,
      };
      storage.upsert(dataObject);
    }));
  },
  handleExport: (
    dataObjects: IImage[],
    labels: ILabel[],
  ): IExport => {
    const uuid2idxInLabels = Object.fromEntries(
      labels.map((d, i) => [d.uuid, i]),
    );
    return dataObjects.map((d) => {
      const partial = {
        uuid: d.uuid,
        url: d.url,
        filename: d.filename,
      };
      const idx = uuid2idxInLabels[d.uuid];
      return idx === undefined ? partial : { ...labels[idx], ...partial };
    });
  },
  display: BaseDisplay,
} as IDataTypeSetup<UploadTarget.Folder>;

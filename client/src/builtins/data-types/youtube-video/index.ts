// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
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
  IVideo,
} from '@/commons/types';
import { parseCsvFile } from '@/plugins/file';
import BaseDisplay from './BaseDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

const getVideoSize = async (url: string): Promise<{
  width: number,
  height: number,
}> => {
  /**
   * reference
   * [1] https://github.com/leedo/noembed
   * [2] https://stackoverflow.com/questions/30084140
   */
  const { data } = await axios.get(`https://noembed.com/embed?url=${url}`);
  const { width, height } = data;
  return { width, height };
};

export default {
  type: DataType.YoutubeVideo,
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.MultiLabelClassification,
    LabelTaskType.FreeformText,
    LabelTaskType.SpanClassification,
  ],
  label: 'youtube video',
  importType: UploadTarget.File,
  handleImport: async (
    file: File,
    storage: IDataObjectStorage,
  ): Promise<void> => {
    const records = await parseCsvFile(file) as { url: string, id: string }[];
    await Promise.all(records.map(async (d) => {
      const content = d.url;
      const uuid = d.id;
      const {
        width,
        height,
      } = await getVideoSize(content);
      const dataObject: IVideo = {
        uuid,
        content,
        width,
        height,
      };
      storage.upsert(dataObject);
    }));
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

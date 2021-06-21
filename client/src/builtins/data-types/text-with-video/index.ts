import { v4 as uuidv4 } from 'uuid';
import {
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  ILabel,
  LabelTaskType,
  UploadTarget,
} from '@/commons/types';
import { parseCsvFile } from '@/plugins/file';
import VDisplay from './VDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

type Datum = {
  text: string;
  url: string;
  timestamp: number;
}

type ITextWithVideo = {
  uuid: string;
  content: {
    text: string;
    url: string;
    timestamp: number;
  };
}

export default {
  type: 'TextWithVideo',
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.FreeformText,
  ],
  label: 'text with video',
  importType: UploadTarget.File,
  handleImport: async (input: File, storage: IDataObjectStorage) => {
    const file = input as File;
    const records = await parseCsvFile(file) as Record<string, any>[];
    await Promise.all(records.map(async (d) => {
      console.log('d', d);
      const dataObject: ITextWithVideo = {
        uuid: uuidv4(),
        content: {
          text: d.text,
          url: d.url,
          timestamp: Number(d.timestamp),
        },
      };
      console.log(dataObject);
      storage.upsert(dataObject);
    }));
  },
  handleExport: <T extends IDataObject>(
    dataObjects: T[],
    labels: ILabel[],
  ): IExport<T> => {
    const uuid2idxInLabels: Record<string, number> = {};
    labels.forEach((d: ILabel, i) => {
      uuid2idxInLabels[d.uuid] = i;
    });
    return dataObjects.map((d) => {
      const partial = {
        uuid: d.uuid,
        content: d.content,
      };
      const idx = uuid2idxInLabels[d.uuid];
      return idx === undefined ? partial : { ...labels[idx], ...partial };
    });
  },
  display: VDisplay,
} as IDataTypeSetup<UploadTarget.File>;
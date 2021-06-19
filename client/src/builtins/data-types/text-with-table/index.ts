import {
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  ILabel,
  LabelTaskType,
  UploadTarget,
} from '@/commons/types';
import { parseJsonFile } from '@/plugins/file';
import VDisplay from './VDisplay.vue';

interface ITextWithTable extends IDataObject {
  /** The content of the data object. */
  content: {
    /** The table stored as a list of objects. */
    table: Record<string, number | string>[];
    /** The sentence accompanying the table. */
    sentence: string;
  };
}

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

export default {
  type: 'TextWithTable',
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.FreeformText,
    LabelTaskType.SpanClassification,
  ],
  label: 'text with table',
  importType: UploadTarget.File,
  handleImport: async (input: File, storage: IDataObjectStorage) => {
    const file = input as File;
    (await parseJsonFile(file) as ITextWithTable[])
      .forEach((entry) => storage.upsert(entry));
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

import {
  IDataObject,
  IDataTypeSetup,
  LabelTaskType,
  IDataObjectStorage,
  ILabel,
  ILabelCategory,
  IText,
} from '@/commons/types';
import { loadJsonFile } from '@/plugins/json-utils';
import VDisplayTextWithTable from './VDisplayTextWithTable.vue';

interface ITextWithTable extends IDataObject {
  /** The content of the data object. */
  content: {
    /** The table stored as a list of objects. */
    table: Record<string, number | string>[];
    /** The sentence accompanying the table. */
    sentence: string;
  };
}

type TextWithTableWithLabel = {
  uuid: string;
  content: ITextWithTable['content'];
  category?: ILabelCategory;
}

export default {
  type: 'TextWithTable',
  tasks: [
    LabelTaskType.Classification,
  ],
  label: 'text with table',
  handleImport: async (input: File, storage: IDataObjectStorage) => {
    const file = input as File;
    (await loadJsonFile(file) as ITextWithTable[])
      .forEach((entry) => storage.upsert(entry));
  },
  handleExport: (
    dataObjects: IText[],
    labels: ILabel[],
  ): Record<string, unknown>[] => {
    const uuid2idxInLabels: Record<string, number> = {};
    labels.forEach((d: ILabel, i) => {
      uuid2idxInLabels[d.uuid] = i;
    });
    return (dataObjects as unknown as ITextWithTable[]).map((d: ITextWithTable) => {
      const result: TextWithTableWithLabel = {
        uuid: d.uuid,
        content: d.content,
      };
      const idx = uuid2idxInLabels[d.uuid];
      if (idx !== undefined) {
        result.category = labels[idx].category;
      }
      return result;
    });
  },
  display: VDisplayTextWithTable,
} as IDataTypeSetup;

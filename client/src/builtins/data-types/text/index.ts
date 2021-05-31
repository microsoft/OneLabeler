import { v4 as uuidv4 } from 'uuid';
import {
  DataType,
  IDataTypeSetup,
  LabelTaskType,
  IDataObjectStorage,
  ILabel,
  ILabelCategory,
  IText,
} from '@/commons/types';
import { loadJsonFile } from '@/plugins/json-utils';
import VDisplayText from './VDisplayText.vue';

type TextWithLabel = {
  uuid: string;
  content: string;
  category?: ILabelCategory;
}

export default {
  type: DataType.Text,
  tasks: [
    LabelTaskType.Classification,
  ],
  label: 'text',
  handleImport: async (input: File, storage: IDataObjectStorage) => {
    const file = input as File;
    (await loadJsonFile(file) as string[]).forEach((content) => {
      const dataObject: IText = {
        uuid: uuidv4(),
        content,
      };
      storage.upsert(dataObject);
    });
  },
  handleExport: (
    dataObjects: IText[],
    labels: ILabel[],
  ): Record<string, unknown>[] => {
    const uuid2idxInLabels: Record<string, number> = {};
    labels.forEach((d: ILabel, i) => {
      uuid2idxInLabels[d.uuid] = i;
    });
    return (dataObjects as IText[]).map((d: IText) => {
      const result: TextWithLabel = {
        uuid: d.uuid,
        content: d.content as string,
      };
      const idx = uuid2idxInLabels[d.uuid];
      if (idx !== undefined) {
        result.category = labels[idx].category;
      }
      return result;
    });
  },
  display: VDisplayText,
} as IDataTypeSetup;

import { v4 as uuidv4 } from 'uuid';
import {
  LabelTaskType,
  UploadTarget,
} from '@/commons/types';
import type {
  IDataObjectStorage,
  IDataTypeSetup,
  ILabel,
} from '@/commons/types';
import { parseJsonFile } from '@/plugins/file';
import BaseDisplay from './BaseDisplay.vue';

/** The interface of a data object to be labeled. */
export interface IDataObject {
  /** The universal unique id of the data object. */
  uuid: string;
  /** The content of the data object. */
  content?: unknown;
}

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

export default {
  type: 'CustomDataType',
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.MultiLabelClassification,
    LabelTaskType.FreeformText,
  ],
  label: 'custom data type name',
  importType: UploadTarget.File,
  handleImport: async (
    file: File,
    storage: IDataObjectStorage,
  ): Promise<void> => {
    (await parseJsonFile(file) as string[]).forEach((content) => {
      const dataObject: IDataObject = {
        uuid: uuidv4(),
        content,
      };
      storage.upsert(dataObject);
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

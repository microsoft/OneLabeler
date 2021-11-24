import { UploadTarget } from '@/commons/types';
import type {
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  ILabel,
} from '@/commons/types';
import {
  parseJsonFile,
  parseCsvFile,
} from '@/plugins/file';
import BaseDisplay from './BaseDisplay.vue';

type IExport = (Partial<ILabel>)[];

interface ITable extends IDataObject {
  /** The content of the data object. */
  content: {
    /** The table stored as a list of objects. */
    table: Record<string, number | string>[];
  };
}

/** Get the extension name from the filename. */
const getExt = (filename: string): string => {
  const ext = filename.split('.').pop() as string;
  return filename === ext ? '' : ext;
};

/** Get the filename with extension name trimmed. */
const trimExt = (filename: string): string => (
  filename.replace(/\.[^/.]+$/, '')
);

type Table = Record<string, string | number>[];

export default {
  type: 'Table',
  tasks: [
    'CustomMultiLabelClassification',
    'CustomFreeformText',
  ],
  label: 'table',
  importType: UploadTarget.Folder,
  handleImport: async (
    files: FileList,
    storage: IDataObjectStorage,
  ): Promise<void> => {
    const pairs: Record<string, { table: unknown, queries: unknown }> = {};
    await Promise.all([...files].map(async (file: File) => {
      const { name } = file;
      const ext = getExt(name);
      const nameTrimmed = trimExt(name);
      if (!(nameTrimmed in pairs)) {
        pairs[nameTrimmed] = { table: null, queries: null };
      }
      if (ext === 'csv') {
        pairs[nameTrimmed].table = await parseCsvFile(file) as Table;
      } else if (ext === 'json') {
        pairs[nameTrimmed].queries = (await parseJsonFile(file)).sentence;
      }
    }));

    Object.entries(pairs).forEach(([key, value]) => {
      const dataObject: ITable = {
        uuid: key,
        content: value,
      };
      storage.upsert(dataObject);
    });
  },
  handleExport: <T extends IDataObject>(
    dataObjects: T[],
    labels: ILabel[],
  ): IExport => {
    const uuid2idxInLabels = Object.fromEntries(
      labels.map((d, i) => [d.uuid, i]),
    );
    return dataObjects.map((d) => {
      const partial = { uuid: d.uuid };
      const idx = uuid2idxInLabels[d.uuid];
      return idx === undefined ? partial : { ...labels[idx], ...partial };
    });
  },
  display: BaseDisplay,
} as IDataTypeSetup<UploadTarget.Folder>;

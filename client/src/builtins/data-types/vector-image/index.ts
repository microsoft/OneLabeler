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
  IVectorImage,
  ILabel,
} from '@/commons/types';
import BaseDisplay from './BaseDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

export default {
  type: DataType.VectorImage,
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.MultiLabelClassification,
    LabelTaskType.FreeformText,
  ],
  label: 'vector image',
  importType: UploadTarget.Folder,
  handleImport: async (
    files: FileList,
    storage: IDataObjectStorage,
  ): Promise<void> => {
    await Promise.all([...files].map(async (file) => {
      const content = await file.text();
      const dataObject: IVectorImage = {
        uuid: uuidv4(),
        content,
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
      const idx = uuid2idxInLabels[d.uuid];
      return {
        ...(idx !== undefined ? labels[idx] : {}),
        uuid: d.uuid,
        content: d.content,
      };
    });
  },
  display: BaseDisplay,
} as IDataTypeSetup<UploadTarget.Folder>;

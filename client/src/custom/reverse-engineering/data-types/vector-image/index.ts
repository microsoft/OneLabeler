import { v4 as uuidv4 } from 'uuid';
import {
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  IVectorImage,
  ILabel,
  LabelTaskType,
  UploadTarget,
} from '@/commons/types';
import BaseDisplay from './BaseDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

export default {
  type: 'CustomVectorImage',
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.MultiLabelClassification,
    LabelTaskType.FreeformText,
  ],
  label: 'custom vector image',
  importType: UploadTarget.Folder,
  handleImport: async (
    files: FileList,
    storage: IDataObjectStorage,
  ): Promise<void> => {
    await Promise.all([...files].map(async (file) => {
      const text = await file.text();
      const svgBlob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' });
      const content = window.URL.createObjectURL(svgBlob);
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

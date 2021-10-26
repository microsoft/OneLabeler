import { v4 as uuidv4 } from 'uuid';
import {
  DataType,
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  IImage,
  ILabel,
  LabelTaskType,
  UploadTarget,
} from '@/commons/types';
import { getImgSize } from '@/commons/utils';
import { getBase64 } from '@/plugins/file';
import VDisplay from './VDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

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
      const content = await getBase64(file);
      const { width, height } = await getImgSize(content);
      const dataObject: IImage = {
        uuid: uuidv4(),
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
    const uuid2idxInLabels: Record<string, number> = {};
    labels.forEach((d: ILabel, i) => {
      uuid2idxInLabels[d.uuid] = i;
    });
    return dataObjects.map((d) => {
      const partial = {
        uuid: d.uuid,
        url: d.url,
        content: d.content,
      };
      const idx = uuid2idxInLabels[d.uuid];
      return idx === undefined ? partial : { ...labels[idx], ...partial };
    });
  },
  display: VDisplay,
} as IDataTypeSetup<UploadTarget.Folder>;

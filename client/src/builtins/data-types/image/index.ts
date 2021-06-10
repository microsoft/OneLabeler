import { v4 as uuidv4 } from 'uuid';
import {
  DataType,
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  IImage,
  ILabel,
  LabelTaskType,
} from '@/commons/types';
import { getBase64 } from '@/plugins/file';
import VDisplayImage from './VDisplayImage.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

const getImgSize = (content: string) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve({ width: img.width, height: img.height });
  img.onerror = (error) => reject(error);
  img.src = content;
}) as Promise<{ width: number, height: number }>;

export default {
  type: DataType.Image,
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.FreeformText,
    LabelTaskType.ObjectDetection,
    LabelTaskType.Segmentation,
  ],
  label: 'image',
  handleImport: async (input: FileList, storage: IDataObjectStorage) => {
    const files = input as FileList;
    await Promise.all([...files].map(async (file) => {
      /*
      const { name } = file;
      const formData = new FormData();
      formData.append('fileToUpload', file);
      formData.append('fileName', name);
      formData.append('key', name);
      const { path, width, height } = (await axios.post(
        `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/dataObject/image`,
        formData,
      )).data;
      const dataObject: IImage = {
        uuid: uuidv4(),
        url: path,
        width,
        height,
      };
      */
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
  display: VDisplayImage,
} as IDataTypeSetup;

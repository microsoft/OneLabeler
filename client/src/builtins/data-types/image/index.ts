import { v4 as uuidv4 } from 'uuid';
import {
  DataType,
  IDataTypeSetup,
  LabelTaskType,
  IDataObjectStorage,
  ILabel,
  ILabelCategory,
  ILabelShape,
  ILabelMask,
  IImage,
} from '@/commons/types';
import { getBase64 } from '@/plugins/file';
import VDisplayImage from './VDisplayImage.vue';

const getImgSize = (content: string) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve({ width: img.width, height: img.height });
  img.onerror = (error) => reject(error);
  img.src = content;
}) as Promise<{ width: number, height: number }>;

type ImageWithLabel = {
  uuid: string;
  url?: string | null;
  content?: string | null;
  category?: ILabelCategory;
  shapes?: ILabelShape[];
  mask?: ILabelMask;
}

export default {
  type: DataType.Image,
  tasks: [
    LabelTaskType.Classification,
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
  handleExport: (
    dataObjects: IImage[],
    labels: ILabel[],
  ): Record<string, unknown>[] => {
    const uuid2idxInLabels: Record<string, number> = {};
    labels.forEach((d: ILabel, i) => {
      uuid2idxInLabels[d.uuid] = i;
    });
    return dataObjects.map((d: IImage) => {
      const result: ImageWithLabel = {
        uuid: d.uuid,
        url: d.url,
        content: d.content,
      };
      const idx = uuid2idxInLabels[d.uuid];
      if (idx !== undefined) {
        const label = labels[idx];
        const { category, shapes, mask } = label;
        if (category !== undefined) result.category = category;
        if (shapes !== undefined) result.shapes = shapes;
        if (mask !== undefined) result.mask = mask;
      }
      return result as Record<string, unknown>;
    });
  },
  display: VDisplayImage,
} as IDataTypeSetup;

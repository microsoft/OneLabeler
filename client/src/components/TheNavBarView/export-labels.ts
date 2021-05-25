import {
  DataType,
  IDataObject,
  IDataObjectStorage,
  IImage,
  IText,
  ILabel,
  ILabelStorage,
  ILabelCategory,
  ILabelShape,
  ILabelMask,
} from '@/commons/types';
import { saveJsonFile } from '@/plugins/json-utils';

type ImageWithLabel = {
  uuid: string;
  url?: string | null;
  content?: string | null;
  category?: ILabelCategory;
  shapes?: ILabelShape[];
  mask?: ILabelMask;
}

type TextWithLabel = {
  uuid: string;
  content: string;
  category?: ILabelCategory;
}

const EXPORT_FILE_NAME = 'labels.json';

const handleImage = (
  dataObjects: IImage[],
  labels: ILabel[],
): ImageWithLabel[] => {
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
    return result;
  });
};

const handleText = (
  dataObjects: IText[],
  labels: ILabel[],
): TextWithLabel[] => {
  const uuid2idxInLabels: Record<string, number> = {};
  labels.forEach((d: ILabel, i) => {
    uuid2idxInLabels[d.uuid] = i;
  });
  return (dataObjects as IText[]).map((d: IText) => {
    const result: TextWithLabel = {
      uuid: d.uuid,
      content: d.content,
    };
    const idx = uuid2idxInLabels[d.uuid];
    if (idx !== undefined) {
      result.category = labels[idx].category;
    }
    return result;
  });
};

const exportLabels = async (
  dataObjectStorage: IDataObjectStorage,
  labelStorage: ILabelStorage,
  dataType: DataType,
): Promise<void> => {
  const dataObjects = (await dataObjectStorage.getAll()) as IDataObject[];
  const labels = (await labelStorage.getAll()) as ILabel[];
  const uuid2idxInLabels: Record<string, number> = {};
  labels.forEach((d: ILabel, i) => {
    uuid2idxInLabels[d.uuid] = i;
  });
  let labeledData;
  if (dataType === DataType.Image) {
    labeledData = handleImage(dataObjects as IImage[], labels);
  } else if (dataType === DataType.Text) {
    labeledData = handleText(dataObjects as IText[], labels);
  }
  saveJsonFile(labeledData, EXPORT_FILE_NAME);
};

export default exportLabels;

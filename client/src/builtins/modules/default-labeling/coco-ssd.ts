import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as CocoSsd from '@tensorflow-models/coco-ssd';
import { v4 as uuidv4 } from 'uuid';
import {
  DataType,
  LabelTaskType,
  ObjectShapeType,
  ModuleType,
} from '@/commons/types';
import type {
  IImage,
  ILabel,
  ILabelShape,
  IDataObjectStorage,
} from '@/commons/types';

// Reference: https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd

const url2image = (url: string): Promise<HTMLImageElement> => (
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve(img);
  })
);

export default {
  type: ModuleType.DefaultLabeling,
  label: 'COCO-SSD-object-detection',
  id: 'COCO-SSD-object-detection-438546',
  inputs: ['dataObjects', 'queryUuids'],
  outputs: ['labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isServerless: true,
  dataTypes: [DataType.Image],
  labelTasks: [LabelTaskType.ObjectDetection],
  run: async (
    inputs: {
      dataObjects: IDataObjectStorage,
      queryUuids: string[],
    },
  ): Promise<{ labels: ILabel[] }> => {
    const model = await CocoSsd.load();
    const dataObjects = await inputs.dataObjects.getBulk(inputs.queryUuids) as IImage[];
    const labels = await Promise.all(dataObjects.map(async (dataObject) => {
      const url = dataObject.content as string;
      const image = await url2image(url);
      const pred = await model.detect(image);
      const shapes: ILabelShape[] = pred.map((d) => ({
        category: d.class,
        shape: ObjectShapeType.Rect,
        position: [
          [d.bbox[0], d.bbox[1]],
          [d.bbox[0] + d.bbox[2], d.bbox[1] + d.bbox[3]],
        ],
        uuid: uuidv4(),
      }));
      return { shapes, uuid: dataObject.uuid };
    }));
    return { labels };
  },
};

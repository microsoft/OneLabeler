import '@tensorflow/tfjs-backend-webgl';
import * as DeepLab from '@tensorflow-models/deeplab';
import {
  DataType,
  LabelTaskType,
  ModuleType,
} from '@/commons/types';
import type {
  IImage,
  ILabel,
  IDataObjectStorage,
  ILabelMask,
} from '@/commons/types';
import { getBase64 } from '@/plugins/file';

// TODO: deeplab predicted mask not rendered, figure out why

// Reference: https://github.com/tensorflow/tfjs-models/tree/master/deeplab

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
  label: 'DeepLab-segmentation',
  id: 'DeepLab-segmentation-438546',
  inputs: ['dataObjects', 'queryUuids'],
  outputs: ['labels'],
  blocking: true,
  isBuiltIn: true,
  isServerless: true,
  dataTypes: [DataType.Image],
  labelTasks: [LabelTaskType.Segmentation2d],
  run: async (
    inputs: {
      dataObjects: IDataObjectStorage,
      queryUuids: string[],
    },
  ): Promise<{ labels: ILabel[] }> => {
    const model = await DeepLab.load();
    const dataObjects = await inputs.dataObjects.getBulk(inputs.queryUuids) as IImage[];
    const labels = await Promise.all(dataObjects.map(async (d, i) => {
      const url = d.content as string;

      const image = await url2image(url);
      const pred = await model.segment(image);
      const predMask = pred.segmentationMap;
      const blob = new Blob([predMask], { type: 'image/png' });
      const content = await getBase64(blob);
      const mask: ILabelMask = {
        content,
        label2color: pred.legend,
        height: pred.height,
        width: pred.width,
      };
      return { uuid: dataObjects[i].uuid, mask };

      /*
      const url = d.content as string;
      const width = d.width as number;
      const height = d.height as number;

      const image = await url2image(url);
      const pred = await model.segment(image);
      const predMask = pred.segmentationMap;
      const seg = tf.image
        .resizeNearestNeighbor(
          tf.tensor(predMask).reshape([pred.height, pred.width, 3]) as tf.Tensor3D,
          [height, width],
        ).dataSync();
      const blob = new Blob([seg], { type: 'image/png' });
      const content = await getBase64(blob);
      const mask: ILabelMask = {
        content,
        label2color: pred.legend,
        height: pred.height,
        width: pred.width,
      };
      return { uuid: dataObjects[i].uuid, mask };
      */
    }));

    return { labels };
  },
};

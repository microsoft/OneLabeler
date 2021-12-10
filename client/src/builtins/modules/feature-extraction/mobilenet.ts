import '@tensorflow/tfjs-backend-webgl';
import * as MobileNet from '@tensorflow-models/mobilenet';
import { DataType, ModuleType } from '@/commons/types';
import type { IImage, IDataObjectStorage } from '@/commons/types';

// Reference: https://github.com/tensorflow/tfjs-models/tree/master/mobilenet

const url2image = (url: string): Promise<HTMLImageElement> => (
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve(img);
  })
);

export default {
  type: ModuleType.FeatureExtraction,
  label: 'MobileNet-embedding',
  id: 'MobileNet-embedding-438546',
  inputs: ['dataObjects', 'queryUuids'],
  outputs: ['features'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isServerless: true,
  dataTypes: [DataType.Image],
  run: async (
    inputs: {
      dataObjects: IDataObjectStorage,
      queryUuids: string[],
    },
  ): Promise<{ features: number[][] }> => {
    const model = await MobileNet.load();
    // If queryUuids empty, compute features for all data objects.
    const dataObjects = inputs.queryUuids.length !== 0
      ? await inputs.dataObjects.getBulk(inputs.queryUuids) as IImage[]
      : await inputs.dataObjects.getAll() as IImage[];
    const urls = dataObjects.map((d) => d.content) as string[];
    const embeddings = await Promise.all(urls.map(async (d) => {
      const image = await url2image(d);
      const embedding = model.infer(image, true).dataSync();
      return [...embedding];
    }));
    return { features: embeddings };
  },
};

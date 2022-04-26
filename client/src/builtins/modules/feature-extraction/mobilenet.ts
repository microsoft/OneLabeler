// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '@tensorflow/tfjs-backend-webgl';
import * as MobileNet from '@tensorflow-models/mobilenet';
import { DataType, ModuleType } from '@/commons/types';
import type { IImage, IDataObjectStorage } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';

// Reference: https://github.com/tensorflow/tfjs-models/tree/master/mobilenet

const url2image = (url: string): Promise<HTMLImageElement> => (
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve(img);
  })
);

export default class MobileNetEmbedding extends BaseModule {
  readonly inputs = ['dataObjects', 'queryUuids'];

  readonly outputs = ['features'];

  readonly id = 'FeatureExtraction-MobileNetEmbedding';

  readonly label = 'MobileNet embedding';

  readonly type = ModuleType.FeatureExtraction;

  readonly dataTypes = [DataType.Image];

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  readonly run = async (
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
  }
}

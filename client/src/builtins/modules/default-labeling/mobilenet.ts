// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '@tensorflow/tfjs-backend-webgl';
import * as MobileNet from '@tensorflow-models/mobilenet';
import {
  DataType,
  LabelTaskType,
  ModuleType,
} from '@/commons/types';
import type {
  IImage,
  ILabel,
  IDataObjectStorage,
} from '@/commons/types';
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

export default class MobileNetClassification extends BaseModule {
  readonly inputs = ['dataObjects', 'queryUuids'];

  readonly outputs = ['labels'];

  readonly id = 'DefaultLabeling-MobileNetClassification';

  readonly label = 'MobileNet classification';

  readonly type = ModuleType.DefaultLabeling;

  readonly dataTypes = [DataType.Image];

  readonly labelTasks = [LabelTaskType.Classification];

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  readonly run = async (
    inputs: {
      dataObjects: IDataObjectStorage,
      queryUuids: string[],
    },
  ): Promise<{ labels: ILabel[] }> => {
    const model = await MobileNet.load();
    const dataObjects = await inputs.dataObjects.getBulk(inputs.queryUuids) as IImage[];
    const urls = dataObjects.map((d) => d.content) as string[];
    const preds = await Promise.all(urls.map(async (d) => {
      const image = await url2image(d);
      const pred = await model.classify(image, 1);
      return pred[0].className;
    }));
    const labels = preds.map((d, i) => ({
      uuid: dataObjects[i].uuid,
      category: String(d),
    }));
    return { labels };
  }
}

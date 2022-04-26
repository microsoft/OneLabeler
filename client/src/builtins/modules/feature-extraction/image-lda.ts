// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import { DataType, ModuleType } from '@/commons/types';
import type {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  IStatus,
  IStatusStorage,
} from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';
import { ALGORITHM_URL } from '@/services/http-params';
import bindErrorHandler from './utils/handle-error';

type RunReturn = { features: number[][], featureNames: string[] };

export default class ImageLDA extends BaseModule {
  readonly inputs = ['dataObjects', 'labels'];

  readonly outputs = ['features'];

  readonly id = 'FeatureExtraction-ImageLDA';

  readonly label = 'LDA (Supervised)';

  readonly type = ModuleType.FeatureExtraction;

  readonly dataTypes = [DataType.Image];

  readonly isBuiltIn = true;

  readonly isServerless = false;

  readonly run = async (
    inputs: {
      dataObjects: IDataObjectStorage,
      labels: ILabelStorage,
      statuses: IStatusStorage,
    },
  ): Promise<RunReturn> => {
    const dataObjects: IDataObject[] = await inputs.dataObjects.getAll();
    const labels: ILabel[] = await inputs.labels.getAll();
    const statuses: IStatus[] = await inputs.statuses.getAll();
    const response = await bindErrorHandler(axios.post(
      `${ALGORITHM_URL}/features/image/LDA`,
      JSON.stringify({
        dataObjects,
        labels,
        statuses,
      }),
    ));
    return response.data as RunReturn;
  }
}

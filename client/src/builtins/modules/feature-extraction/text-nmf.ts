// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import { DataType, ModuleType } from '@/commons/types';
import type { IDataObject, IDataObjectStorage } from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';
import { ALGORITHM_URL } from '@/services/http-params';
import bindErrorHandler from './utils/handle-error';

type RunReturn = { features: number[][], featureNames: string[] };

export default class TextNMF extends BaseModule {
  readonly inputs = ['dataObjects'];

  readonly outputs = ['features'];

  readonly id = 'FeatureExtraction-TextNMF';

  readonly label = 'NMF (Unsupervised)';

  readonly type = ModuleType.FeatureExtraction;

  readonly dataTypes = [DataType.Text];

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = false;

  readonly run = async (
    inputs: { dataObjects: IDataObjectStorage },
  ): Promise<RunReturn> => {
    const dataObjects: IDataObject[] = await inputs.dataObjects.getAll();
    const response = await bindErrorHandler(axios.post(
      `${ALGORITHM_URL}/features/text/NMF`,
      JSON.stringify({ dataObjects }),
    ));
    return response.data as RunReturn;
  }
}

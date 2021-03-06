// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import { DataType, ModuleType } from '@/commons/types';
import type { IDataObject, IDataObjectStorage } from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';
import bindErrorHandler from './utils/handle-error';

type RunReturn = { features: number[][], featureNames: string[] };

export default {
  type: ModuleType.FeatureExtraction,
  label: 'SVD (Unsupervised)',
  id: 'image-SVD-25940167',
  inputs: ['dataObjects'],
  outputs: ['features'],
  blocking: true,
  isBuiltIn: true,
  isServerless: false,
  dataTypes: [DataType.Image],
  run: async (
    inputs: { dataObjects: IDataObjectStorage },
  ): Promise<RunReturn> => {
    const dataObjects: IDataObject[] = await inputs.dataObjects.getAll();
    const response = await bindErrorHandler(axios.post(
      `${ALGORITHM_URL}/features/image/SVD`,
      JSON.stringify({ dataObjects }),
    ));
    return response.data as RunReturn;
  },
};

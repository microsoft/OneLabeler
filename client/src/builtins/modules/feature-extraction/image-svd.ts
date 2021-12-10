import axios, { AxiosError, AxiosResponse } from 'axios';
import { DataType, ModuleType } from '@/commons/types';
import type { IDataObject, IDataObjectStorage } from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';

const bindErrorHandler = (response: Promise<AxiosResponse>) => {
  response.catch((e: AxiosError) => {
    if (e.request !== undefined && e.response === undefined) {
      // The service cannot be connected.
      throw new TypeError('Cannot Connect to Feature Extraction Server');
    } else {
      throw e;
    }
  });
  return response;
};

type RunReturn = { features: number[][], featureNames: string[] };

export default {
  type: ModuleType.FeatureExtraction,
  label: 'SVD (Unsupervised)',
  id: 'image-SVD-25940167',
  inputs: ['dataObjects'],
  outputs: ['features'],
  isAlgorithmic: true,
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

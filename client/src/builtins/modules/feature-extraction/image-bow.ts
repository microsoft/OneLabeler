import axios, { AxiosError, AxiosResponse } from 'axios';
import { DataType, ProcessType } from '@/commons/types';
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
  type: ProcessType.FeatureExtraction,
  label: 'BoW (Handcrafted)',
  id: 'image-BoW-6989392',
  inputs: ['dataObjects'],
  outputs: ['features'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  dataTypes: [DataType.Image],
  run: async (
    inputs: { dataObjects: IDataObjectStorage },
  ): Promise<RunReturn> => {
    const dataObjects: IDataObject[] = await inputs.dataObjects.getAll();
    const response = await bindErrorHandler(axios.post(
      `${ALGORITHM_URL}/features/image/BoW`,
      JSON.stringify({ dataObjects }),
    ));
    return response.data as RunReturn;
  },
};

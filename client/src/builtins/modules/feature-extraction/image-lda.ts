import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  DataType,
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  IStatus,
  IStatusStorage,
  ProcessType,
} from '@/commons/types';
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
  label: 'LDA (Supervised)',
  id: 'image-LDA-45100847',
  inputs: ['dataObjects', 'labels'],
  outputs: ['features'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: false,
  dataTypes: [DataType.Image],
  run: async (
    inputs: {
      dataObjects: IDataObjectStorage
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
  },
};

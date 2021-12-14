import axios from 'axios';
import { DataType, ModuleType } from '@/commons/types';
import type { IDataObject, IDataObjectStorage } from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';
import bindErrorHandler from './utils/handle-error';

type RunReturn = { features: number[][], featureNames: string[] };

export default {
  type: ModuleType.FeatureExtraction,
  label: 'NMF (Unsupervised)',
  id: 'text-NMF-78139065',
  inputs: ['dataObjects'],
  outputs: ['features'],
  isBuiltIn: true,
  isServerless: false,
  dataTypes: [DataType.Text],
  run: async (
    inputs: { dataObjects: IDataObjectStorage },
  ): Promise<RunReturn> => {
    const dataObjects: IDataObject[] = await inputs.dataObjects.getAll();
    const response = await bindErrorHandler(axios.post(
      `${ALGORITHM_URL}/features/text/NMF`,
      JSON.stringify({ dataObjects }),
    ));
    return response.data as RunReturn;
  },
};

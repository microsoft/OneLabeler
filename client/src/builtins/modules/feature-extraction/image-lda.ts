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
import { ALGORITHM_URL } from '@/services/http-params';
import bindErrorHandler from './utils/handle-error';

type RunReturn = { features: number[][], featureNames: string[] };

export default {
  type: ModuleType.FeatureExtraction,
  label: 'LDA (Supervised)',
  id: 'image-LDA-45100847',
  inputs: ['dataObjects', 'labels'],
  outputs: ['features'],
  isBuiltIn: true,
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

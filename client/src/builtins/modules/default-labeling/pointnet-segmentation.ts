import axios from 'axios';
import {
  DataType,
  IDataObjectStorage,
  ILabel,
  LabelTaskType,
  ModuleType,
} from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';
import bindErrorHandler from './utils/handle-error';

export default {
  type: ModuleType.DefaultLabeling,
  label: 'PointNet-segmentation',
  id: 'PointNet-segmentation-438546',
  inputs: ['dataObjects', 'queryUuids'],
  outputs: ['labels'],
  isBuiltIn: true,
  isServerless: false,
  dataTypes: [DataType.PointCloud],
  labelTasks: [LabelTaskType.Segmentation3d],
  run: async (
    inputs: {
      dataObjects: IDataObjectStorage,
      queryUuids: string[],
    },
  ): Promise<{ labels: ILabel[] }> => {
    const queriedDataObjects = await inputs.dataObjects
      .getBulk(inputs.queryUuids);
    const response = await bindErrorHandler(axios.post(
      `${ALGORITHM_URL}/defaultLabels/PointNet-segmentation`,
      JSON.stringify({ dataObjects: queriedDataObjects }),
    ));
    return response.data as { labels: ILabel[] };
  },
};

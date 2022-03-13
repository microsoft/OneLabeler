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
  label: 'POS-tagging',
  id: 'POS-tagging-438546',
  inputs: ['dataObjects', 'queryUuids'],
  outputs: ['labels'],
  blocking: true,
  isBuiltIn: true,
  isServerless: false,
  dataTypes: [DataType.Text],
  labelTasks: [LabelTaskType.SpanClassification],
  run: async (
    inputs: {
      dataObjects: IDataObjectStorage,
      queryUuids: string[],
    },
  ): Promise<{ labels: ILabel[] }> => {
    const queriedDataObjects = await inputs.dataObjects
      .getBulk(inputs.queryUuids);
    const response = await bindErrorHandler(axios.post(
      `${ALGORITHM_URL}/defaultLabels/PosTagging`,
      JSON.stringify({ dataObjects: queriedDataObjects }),
    ));
    return response.data as { labels: ILabel[] };
  },
};

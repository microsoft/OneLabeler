import axios from 'axios';
import { ModuleType } from '@/commons/types';
import type {
  Category,
  IDataObjectStorage,
  ILabel,
  ModelService,
} from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';
import bindErrorHandler from './utils/handle-error';

export default {
  type: ModuleType.DefaultLabeling,
  label: 'Model Prediction',
  id: 'ModelPrediction-29967546',
  inputs: ['features', 'model', 'queryUuids'],
  outputs: ['labels'],
  isBuiltIn: true,
  isServerless: false,
  model: undefined,
  run: async (
    inputs: {
      dataObjects: IDataObjectStorage,
      model: ModelService,
      queryUuids: string[],
      categories: Category[],
      unlabeledMark: Category,
    },
  ): Promise<{ labels: ILabel[] }> => {
    const queriedDataObjects = await inputs.dataObjects
      .getBulk(inputs.queryUuids);
    const { model, categories, unlabeledMark } = inputs;
    const response = await bindErrorHandler(axios.post(
      `${ALGORITHM_URL}/defaultLabels/ModelPrediction`,
      JSON.stringify({
        dataObjects: queriedDataObjects,
        model,
        categories,
        unlabeledMark,
      }),
    ));
    return response.data as { labels: ILabel[] };
  },
};

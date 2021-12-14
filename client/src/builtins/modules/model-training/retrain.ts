import axios from 'axios';
import { ModuleType, StatusType } from '@/commons/types';
import type {
  Category,
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  IStatus,
  IStatusStorage,
  ModelService,
} from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';
import bindErrorHandler from './utils/handle-error';

export default {
  type: ModuleType.ModelTraining,
  label: 'Retrain',
  id: 'Retrain',
  inputs: ['features', 'labels', 'model'],
  outputs: ['model'],
  isBuiltIn: true,
  isServerless: false,
  run: async (
    inputs: {
      dataObjects: IDataObjectStorage,
      labels: ILabelStorage,
      statuses: IStatusStorage,
      unlabeledMark: Category,
      model: ModelService,
    },
  ): Promise<{ model: ModelService }> => {
    const dataObjects: IDataObject[] = await inputs.dataObjects.getAll();
    const uuids: string[] = await inputs.dataObjects.uuids();
    const labels: (ILabel | undefined)[] = await inputs.labels.getBulk(uuids);
    const statuses: IStatus[] = (await inputs.statuses.getBulk(uuids))
      .map((d, i) => (d ?? { uuid: uuids[i], value: StatusType.New }));
    const { model } = inputs;

    const response = await bindErrorHandler(axios.post(
      `${ALGORITHM_URL}/modelUpdated/Retrain`,
      JSON.stringify({
        model,
        dataObjects,
        labels,
        statuses,
      }),
    ));
    return response.data as { model: ModelService };
  },
};

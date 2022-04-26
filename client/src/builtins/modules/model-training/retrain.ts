// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
import BaseModule from '@/builtins/modules/base-module';
import bindErrorHandler from './utils/handle-error';

export default class Retrain extends BaseModule {
  readonly inputs = ['features', 'labels', 'model'];

  readonly outputs = ['model'];

  readonly id = 'ModelTraining-Retrain';

  readonly label = 'Retrain';

  readonly type = ModuleType.ModelTraining;

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = false;

  readonly run = async (
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
  }
}

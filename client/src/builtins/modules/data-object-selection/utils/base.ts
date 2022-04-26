import axios from 'axios';
import { ModuleType, StatusType } from '@/commons/types';
import type {
  IDataObject,
  IDataObjectStorage,
  IStatus,
  IStatusStorage,
  ModelService,
} from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';
import bindErrorHandler from './handle-error';

/**
 * Workflow Component - Data Object Selection (Algorithmic)
 * Sample a batch of data objects from the pool of data objects.
 * @param dataObjects The data objects to be sampled from.
 * @param nBatch The number of data objects to sample.
 * @returns queryUuids - the uuids of sampled data objects.
 */
const serverExecute = async (
  api: string,
  dataObjectStorage: IDataObjectStorage,
  statusStorage: IStatusStorage,
  nBatch: number,
  model?: ModelService,
): Promise<string[]> => {
  const uuids = await dataObjectStorage.uuids();
  const statuses: IStatus[] = (await statusStorage.getBulk(uuids))
    .map((d, i) => (d ?? { uuid: uuids[i], value: StatusType.New }));

  // Note: remove the raw content to save storage.
  const dataObjects: IDataObject[] = (await (dataObjectStorage).getAll())
    .map((d) => ({ ...d, content: undefined }));

  const response = await bindErrorHandler(axios.post(
    api,
    JSON.stringify({
      statuses: statuses.map((d) => d.value),
      nBatch,
      dataObjects,
      model,
    }),
  ));
  const { queryIndices } = response.data as { queryIndices: number[] };
  const queryUuids = queryIndices.map((d) => uuids[d]);
  return queryUuids;
};

export default class BaseDataObjectSelectionServerModule extends BaseModule {
  readonly type = ModuleType.DataObjectSelection;

  readonly isServerless = false;

  api = '';

  params = {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
        { value: 4, label: '4' },
        { value: 16, label: '16' },
        { value: 32, label: '32' },
        { value: 48, label: '48' },
        { value: 64, label: '64' },
        { value: 96, label: '96' },
      ],
    },
  };

  readonly run = async (
    inputs: {
      dataObjects: IDataObjectStorage,
      statuses: IStatusStorage,
      model?: ModelService,
    },
  ): Promise<{ queryUuids: string[] }> => {
    const nBatch = this.params.nBatch.value;
    const { api } = this;
    const queryUuids = await serverExecute(
      api,
      inputs.dataObjects,
      inputs.statuses,
      nBatch,
      inputs.model,
    );
    return { queryUuids };
  }
}

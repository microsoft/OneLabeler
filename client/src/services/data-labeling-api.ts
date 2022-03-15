// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable import/prefer-default-export */
/**
 * api for communicating with img labeling functions at server
 * @namespace
 */

import axios, { AxiosError } from 'axios';
import { xor4096 } from 'seedrandom';
import { randomChoice } from '@/plugins/random';
import { StatusType } from '@/commons/types';
import type {
  IDataObject,
  IDataObjectStorage,
  IStatus,
  IStatusStorage,
  ModelService,
  IModule,
} from '@/commons/types';

/**
 * Workflow Component - Data Object Selection (Algorithmic)
 * Sample a batch of data objects from the pool of data objects.
 * @param dataObjects The data objects to be sampled from.
 * @param nBatch The number of data objects to sample.
 * @returns queryUuids - the uuids of sampled data objects.
 */
export const dataObjectSelection = async (
  method: IModule,
  dataObjectStorage: IDataObjectStorage,
  statusStorage: IStatusStorage,
  nBatch: number,
  model?: ModelService,
): Promise<string[]> => {
  const uuids = await dataObjectStorage.uuids();
  const statuses: IStatus[] = (await statusStorage.getBulk(uuids)).map((d, i) => (
    d ?? { uuid: uuids[i], value: StatusType.New }
  ));

  if (method.isServerless && (method.api === 'DatasetOrder')) {
    let queryUuids: string[];
    const uuidsNew: string[] = statuses
      .filter((d) => d.value === StatusType.New)
      .map((d) => d.uuid);
    if (uuidsNew.length >= nBatch) {
      queryUuids = uuidsNew.slice(0, nBatch);
    } else {
      const nResidue = nBatch - uuidsNew.length;
      const uuidsSkipped = statuses
        .filter((d) => d.value === StatusType.Skipped)
        .map((d) => d.uuid);
      const queryUuidsSkipped = uuidsSkipped.length <= nResidue
        ? uuidsSkipped
        : uuidsSkipped.slice(0, nResidue);
      queryUuids = [...uuidsNew, ...queryUuidsSkipped];
    }

    return queryUuids;
  }

  if (method.isServerless && (method.api === 'Random')) {
    let queryUuids: string[];
    const SEED = '20';
    const random = xor4096(SEED);
    const uuidsNew: string[] = statuses
      .filter((d) => d.value === StatusType.New)
      .map((d) => d.uuid);
    if (uuidsNew.length >= nBatch) {
      queryUuids = randomChoice(uuidsNew, nBatch, random);
    } else {
      const nResidue = nBatch - uuidsNew.length;
      const uuidsSkipped = statuses
        .filter((d) => d.value === StatusType.Skipped)
        .map((d) => d.uuid);
      const queryUuidsSkipped = uuidsSkipped.length <= nResidue
        ? uuidsSkipped
        : randomChoice(uuidsSkipped, nResidue, random);
      queryUuids = [...uuidsNew, ...queryUuidsSkipped];
    }

    return queryUuids;
  }

  // Note: remove the raw content to save storage.
  const dataObjects: IDataObject[] = (await dataObjectStorage.getAll())
    .map((d) => ({ ...d, content: undefined }));

  let queryIndices: number[];
  try {
    const data = (
      await axios.post(
        method.api as string,
        JSON.stringify({
          statuses,
          nBatch,
          dataObjects,
          model,
        }),
      )
    ).data as { queryIndices: number[] };
    queryIndices = data.queryIndices;
  } catch (e) {
    if (
      (e as AxiosError).request !== undefined
      && (e as AxiosError).response === undefined
    ) {
      // The service cannot be connected.
      throw new TypeError('Cannot Connect to Data Object Selection Server');
    } else {
      throw e;
    }
  }
  const queryUuids = queryIndices.map((d) => uuids[d]);
  return queryUuids;
};

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { xor4096 } from 'seedrandom';
import { randomChoice } from '@/plugins/random';
import { ModuleType, StatusType } from '@/commons/types';
import type {
  IDataObjectStorage,
  IStatus,
  IStatusStorage,
} from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';

const SEED = '20';
const random = xor4096(SEED);

const getAllStatuses = async (
  dataObjects: IDataObjectStorage,
  statuses: IStatusStorage,
): Promise<IStatus[]> => {
  const uuids = await dataObjects.uuids();
  return (await statuses.getBulk(uuids)).map((d, i) => (
    d ?? { uuid: uuids[i], value: StatusType.New }
  ));
};

export default class Random extends BaseModule {
  readonly inputs = ['dataObjects', 'labels'];

  readonly outputs = ['queryUuids'];

  readonly id = 'DataObjectSelection-Random';

  readonly label = 'Random';

  readonly type = ModuleType.DataObjectSelection;

  readonly blocking = true;

  readonly isBuiltIn = true;

  readonly isServerless = true;

  params = {
    nBatch: {
      value: 48,
      label: 'Selection Batch Size',
      options: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
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
    },
  ): Promise<{ queryUuids: string[] }> => {
    const nBatch = this.params.nBatch.value;
    const statuses: IStatus[] = await getAllStatuses(inputs.dataObjects, inputs.statuses);

    let queryUuids: string[];
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

    return { queryUuids };
  }
}

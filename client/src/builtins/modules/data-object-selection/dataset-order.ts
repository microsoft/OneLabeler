// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModuleType, StatusType } from '@/commons/types';
import type {
  IDataObjectStorage,
  IStatus,
  IStatusStorage,
} from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';

const getAllStatuses = async (
  dataObjects: IDataObjectStorage,
  statuses: IStatusStorage,
): Promise<IStatus[]> => {
  const uuids = await dataObjects.uuids();
  return (await statuses.getBulk(uuids)).map((d, i) => (
    d ?? { uuid: uuids[i], value: StatusType.New }
  ));
};

export default class DatasetOrder extends BaseModule {
  readonly inputs = ['labels'];

  readonly outputs = ['queryUuids'];

  readonly id = 'DataObjectSelection-DatasetOrder';

  readonly label = 'DatasetOrder (Dummy)';

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

    return { queryUuids };
  }
}

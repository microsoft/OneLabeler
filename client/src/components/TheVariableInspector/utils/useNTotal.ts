// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  onMounted,
  ref,
  watch,
} from '@vue/composition-api';
import type { Ref } from '@vue/composition-api';
import type { IDataObjectStorage } from '@/commons/types';

const useNTotal = (dataObjects: Ref<IDataObjectStorage | null>) => {
  const nTotal: Ref<number> = ref(0);
  const updateNLabeled = async (): Promise<void> => {
    if (dataObjects.value === null) nTotal.value = 0;
    else nTotal.value = await dataObjects.value.count();
  };
  onMounted(updateNLabeled);
  watch(dataObjects, updateNLabeled);
  return { nTotal };
};

export default useNTotal;

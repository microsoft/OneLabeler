import { ref, watch } from '@vue/composition-api';
import type { Ref } from '@vue/composition-api';
import type { IDataObjectStorage } from '@/commons/types';

// TODO: import useNDataObjects in vue components that rely on nDataObjects

/** Get continuously updated n data objects. */
const useNDataObjects = (dataObjects: Ref<IDataObjectStorage>) => {
  const nDataObjects: Ref<number> = ref(0);

  watch(dataObjects, async () => {
    nDataObjects.value = dataObjects.value === null
      ? 0
      : await dataObjects.value.count();
  });
  return { nDataObjects };
};

export default useNDataObjects;

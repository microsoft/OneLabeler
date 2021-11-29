import { ref, watchEffect } from '@vue/composition-api';
import type { Ref } from '@vue/composition-api';
import { StatusType } from '@/commons/types';
import type {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  IStatus,
  IStatusStorage,
} from '@/commons/types';

export const useFilteredDataObjects = (
  dataObjects: Ref<IDataObjectStorage | null>,
  filterUuids: Ref<string[] | null>,
) => {
  const filteredDataObjects: Ref<IDataObject[]> = ref([]);
  const getFilteredDataObjects = async (): Promise<IDataObject[]> => {
    if (dataObjects.value === null) return [];
    if (filterUuids.value === null) return dataObjects.value.getAll();
    const values = await dataObjects.value.getBulk(filterUuids.value);
    values.forEach((d, i) => {
      if (d === undefined) {
        throw new Error(`data object with uuid ${(filterUuids.value as string[])[i]} not found`);
      }
    });
    return values as IDataObject[];
  };
  watchEffect(async (): Promise<void> => {
    filteredDataObjects.value = await getFilteredDataObjects();
  });
  return { filteredDataObjects };
};

export const useFilteredLabels = (
  dataObjects: Ref<IDataObjectStorage | null>,
  labels: Ref<ILabelStorage | null>,
  filterUuids: Ref<string[] | null>,
) => {
  const filteredLabels: Ref<ILabel[]> = ref([]);
  const getFilteredLabels = async (): Promise<ILabel[]> => {
    if (dataObjects.value === null || labels.value === null) return [];
    const uuids = filterUuids.value ?? await dataObjects.value.uuids();
    return (await labels.value.getBulk(uuids))
      .map((d, i) => (d ?? { uuid: uuids[i] }));
  };
  watchEffect(async (): Promise<void> => {
    filteredLabels.value = await getFilteredLabels();
  });
  return { filteredLabels };
};

export const useFilteredStatuses = (
  dataObjects: Ref<IDataObjectStorage | null>,
  statuses: Ref<IStatusStorage | null>,
  filterUuids: Ref<string[] | null>,
) => {
  const filteredStatuses: Ref<ILabel[]> = ref([]);
  const getFilteredStatuses = async (): Promise<IStatus[]> => {
    if (dataObjects.value === null || statuses.value === null) return [];
    const uuids = filterUuids.value ?? await dataObjects.value.uuids();
    return (await statuses.value.getBulk(uuids))
      .map((d, i) => (d ?? { uuid: uuids[i], value: StatusType.New }));
  };
  watchEffect(async (): Promise<void> => {
    filteredStatuses.value = await getFilteredStatuses();
  });
  return { filteredStatuses };
};

/**
 * api for communicating with img labeling functions at server
 * @namespace
 */

import axios from 'axios';
import { xor4096 } from 'seedrandom';
import { randomChoice } from '@/plugins/random';
import {
  Category,
  DataType,
  IDataObject,
  IDataObjectStorage,
  IStatus,
  IStatusStorage,
  ILabel,
  ILabelStorage,
  ILabelCategory,
  StatusType,
  ModelService,
  Process,
} from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';

/**
 * Workflow Component - Data Object Extraction
 * Extract data objects from the data source.
 * @param input the uploaded file(s).
 * @returns queryIndices - the indices of sampled data objects.
 * @Note The extraction implementation is dependent
 * on the data source type and data object type.
 */
export const dataObjectExtraction = async (
  input: File | FileList,
  dataType: DataType,
  storage: IDataObjectStorage,
): Promise<IDataObjectStorage> => {
  const dataTypeSetup = dataTypeSetups.find((d) => d.type === dataType);
  if (dataTypeSetup === undefined) {
    console.warn(`Invalid Data Type: ${dataType}`);
    return storage;
  }
  await dataTypeSetup.handleImport(input, storage);
  return storage.shallowCopy();
};

/**
 * Workflow Component - Default Labeling
 * Assign default labels to a batch of data objects (for the user to verify).
 * @param dataObjects The data objects to be assigned default labels.
 * @param model The default labeling model.
 * @returns defaultLabels - the default labels of the selected data objects.
 */
export const defaultLabeling = async (
  method: Process,
  dataObjects: IDataObject[],
  model: ModelService,
  classes: Category[] | null = null,
  unlabeledMark: Category | null = null,
): Promise<Partial<ILabel>[]> => {
  if (method.isServerless && (method.api === 'Null')) {
    if (unlabeledMark === null) throw new TypeError('unlabeled mark not given');

    const nDataObjects = dataObjects.length;
    const labelCategories = Array(nDataObjects).fill(null).map(() => unlabeledMark);
    const labels = labelCategories.map((d) => ({ category: d }));
    return labels;
  }
  if (method.isServerless && (method.api === 'Random')) {
    if (classes === null) throw new TypeError('classes not given');

    const SEED = '20';
    const random = xor4096(SEED);
    const nClasses = classes.length;
    const labelCategories = dataObjects.map(() => classes[Math.floor(random() * nClasses)]);
    const labels = labelCategories.map((d) => ({ category: d }));
    return labels;
  }

  let labels: Partial<ILabel>[];

  try {
    const data = (await axios.post(
      method.api,
      JSON.stringify({
        dataObjects,
        model,
        classes,
        unlabeledMark,
      }),
    )).data as { labels: Partial<ILabel>[] };
    labels = data.labels;
  } catch (e) {
    if (e.request !== undefined && e.response === undefined) {
      // The service cannot be connected.
      throw new TypeError('Cannot Connect to Default Labeling Server');
    } else {
      throw e;
    }
  }

  return labels;
};

/**
 * Workflow Component - Data Object Selection (Algorithmic)
 * Sample a batch of data objects from the pool of data objects.
 * @param dataObjects The data objects to be sampled from.
 * @param nBatch The number of data objects to sample.
 * @returns queryUuids - the uuids of sampled data objects.
 */
export const dataObjectSelection = async (
  method: Process,
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
  const dataObjects: IDataObject[] = (await (dataObjectStorage as IDataObjectStorage)
    .getAll())
    .map((d) => ({ ...d, content: undefined }));

  let queryIndices: number[];
  try {
    const data = (
      await axios.post(
        method.api as string,
        JSON.stringify({
          statuses: statuses.map((d) => d.value),
          nBatch,
          dataObjects,
          model,
        }),
      )
    ).data as { queryIndices: number[] };
    queryIndices = data.queryIndices;
  } catch (e) {
    if (e.request !== undefined && e.response === undefined) {
      // The service cannot be connected.
      throw new TypeError('Cannot Connect to Data Object Selection Server');
    } else {
      throw e;
    }
  }
  const queryUuids = queryIndices.map((d) => uuids[d]);
  return queryUuids;
};

/**
 * Workflow Components - Default Label Model Update & Sampling Model Update
 * Update the default labeling and active sampling model
 * with the partially user-labeled data object set.
 * @param dataObjects The data objects to be assigned default labels.
 * @param labels The labels of the data objects.
 * @param statuses The label statuses of the data objects.
 * @param model The model to be updated.
 * @returns modelUpdated - the updated model.
 */
export const modelTraining = async (
  method: Process,
  model: ModelService,
  unlabeledMark: Category,
  dataObjectStorage: IDataObjectStorage | null = null,
  LabelStorage: ILabelStorage | null = null,
  statusStorage: IStatusStorage | null = null,
): Promise<ModelService> => {
  if (method.isBuiltIn && (method.api === 'Static')) {
    return model;
  }
  if (dataObjectStorage === null
    || LabelStorage === null
    || statusStorage === null) {
    return model;
  }
  const dataObjects: IDataObject[] = await dataObjectStorage.getAll();
  const uuids: string[] = await dataObjectStorage.uuids();
  const labels: ILabelCategory[] = (await LabelStorage.getBulk(uuids))
    .map((d) => (d === undefined ? unlabeledMark : d.category as string));
  const statuses: StatusType[] = (await statusStorage.getBulk(uuids))
    .map((d) => (d === undefined ? StatusType.New : d.value));

  let modelUpdated: ModelService;

  try {
    const data = (
      await axios.post(
        method.api as string,
        JSON.stringify({
          model,
          dataObjects,
          labels,
          statuses,
        }),
      )
    ).data as { model: ModelService };
    modelUpdated = data.model;
  } catch (e) {
    if (e.request !== undefined && e.response === undefined) {
      // The service cannot be connected.
      throw new TypeError('Cannot Connect to Interim Model Training Server');
    } else {
      throw e;
    }
  }

  return modelUpdated;
};

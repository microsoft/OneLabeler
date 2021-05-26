/**
 * api for communicating with img labeling functions at server
 * @namespace
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { xor4096 } from 'seedrandom';
import showProgressBar from '@/plugins/nprogress-interceptor';
import { loadJsonFile } from '@/plugins/json-utils';
import { randomChoice } from '@/plugins/random';
import { getBase64 } from '@/plugins/file';
import {
  Category,
  DataType,
  IText,
  IImage,
  IDataObject,
  IDataObjectStorage,
  IStatus,
  IStatusStorage,
  ILabelStorage,
  ILabelCategory,
  StatusType,
  ModelService,
  Process,
} from '@/commons/types';

const getImgSize = (content: string) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve({ width: img.width, height: img.height });
  img.onerror = (error) => reject(error);
  img.src = content;
}) as Promise<{ width: number, height: number }>;

/**
 * Workflow Component - Data Object Extraction
 * Extract data objects from the data source.
 * @param input the uploaded file(s).
 * @returns queryIndices - the indices of sampled data objects.
 * @Note The extraction implementation is dependent
 * on the data source type and data object type.
 */
export const dataObjectExtraction = showProgressBar(async (
  input: File | FileList,
  dataType: DataType,
  storage: IDataObjectStorage,
): Promise<IDataObjectStorage> => {
  if (dataType === DataType.Image) {
    const files = input as FileList;
    await Promise.all([...files].map(async (file) => {
      /*
      const { name } = file;
      const formData = new FormData();
      formData.append('fileToUpload', file);
      formData.append('fileName', name);
      formData.append('key', name);
      const { path, width, height } = (await axios.post(
        `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/dataObject/image`,
        formData,
      )).data;
      const dataObject: IImage = {
        uuid: uuidv4(),
        url: path,
        width,
        height,
      };
      */
      const content = await getBase64(file);
      const { width, height } = await getImgSize(content);
      const dataObject: IImage = {
        uuid: uuidv4(),
        content,
        width,
        height,
      };
      storage.upsert(dataObject);
    }));
  } else if (dataType === DataType.Text) {
    const file = input as File;
    (await loadJsonFile(file) as string[]).forEach((content) => {
      const dataObject: IText = {
        uuid: uuidv4(),
        content,
      };
      storage.upsert(dataObject);
    });
  } else {
    console.warn(`Invalid Data Type: ${dataType}`);
  }
  return storage.shallowCopy();
});

/**
 * Workflow Component - Feature Extraction
 * Extract features for each data object.
 * @param dataObjects the data objects for which to extract the features.
 * @returns updatedDataObjects - the data objects with extracted features.
 * @Note The extraction implementation is dependent
 * on the data object type.
 */
export const featureExtraction = showProgressBar(async (
  method: Process,
  dataObjects: IDataObjectStorage,
  labels: ILabelStorage | null = null,
  statuses: IStatusStorage | null = null,
): Promise<{ dataObjects: IDataObjectStorage, featureNames: string[] }> => {
  if (method.isServerless && (method.api === 'Random3D')) {
    const SEED = '20';
    const random = xor4096(SEED);
    const uuids = await dataObjects.uuids();
    await Promise.all(uuids.map(async (uuid) => {
      const features = [random(), random(), random()];
      const dataObject = await dataObjects.get(uuid);
      if (dataObject === undefined) return;
      await dataObjects.upsert({ ...dataObject, features });
    }));
    const featureNames = [
      'Random[0]',
      'Random[1]',
      'Random[2]',
    ];
    return { dataObjects, featureNames };
  }
  const dataObjectValues = await dataObjects.getAll() as IImage[];
  const labelValues = labels !== null
    ? (await labels.getAll()).map((d) => d.category as Category)
    : null;
  const statusValues = statuses !== null
    ? (await statuses.getAll()).map((d) => d.value)
    : null;
  const response = (
    await axios.post(
      method.api as string,
      JSON.stringify({
        dataObjects: dataObjectValues,
        labels: labelValues,
        statuses: statusValues,
      }),
    )
  ).data as { dataObjects: IDataObject[], featureNames: string[] };
  dataObjects.upsertBulk(response.dataObjects);
  return {
    dataObjects,
    featureNames: response.featureNames,
  };
});

/**
 * Workflow Component - Default Labeling
 * Assign default labels to a batch of data objects (for the user to verify).
 * @param dataObjects The data objects to be assigned default labels.
 * @param model The default labeling model.
 * @returns defaultLabels - the default labels of the selected data objects.
 */
export const defaultLabeling = showProgressBar(async (
  method: Process,
  dataObjects: IDataObject[],
  model: ModelService,
  classes: Category[] | null = null,
  unlabeledMark: Category | null = null,
): Promise<ILabelCategory[]> => {
  let labels = null;
  if (method.isServerless && (method.api === 'Null')) {
    labels = dataObjects.map(() => unlabeledMark);
  } else if (method.isServerless && (method.api === 'Random')) {
    const SEED = '20';
    const random = xor4096(SEED);
    const nClasses = (classes as Category[]).length;
    labels = dataObjects.map(() => (
      (classes as Category[])[Math.floor(random() * nClasses)]
    ));
  } else {
    labels = (
      await axios.post(
        method.api as string,
        JSON.stringify({
          dataObjects,
          model,
          classes,
          unlabeledMark,
        }),
      )
    ).data.labels;
  }
  return labels as ILabelCategory[];
});

/**
 * Workflow Component - Data Object Selection (Algorithmic)
 * Sample a batch of data objects from the pool of data objects.
 * @param dataObjects The data objects to be sampled from.
 * @param nBatch The number of data objects to sample.
 * @returns queryUuids - the uuids of sampled data objects.
 */
export const dataObjectSelection = showProgressBar(async (
  method: Process,
  dataObjectStorage: IDataObjectStorage,
  statusStorage: IStatusStorage,
  nBatch: number,
  model?: ModelService,
): Promise<string[]> => {
  let queryUuids = null;
  const uuids = await dataObjectStorage.uuids();
  const statuses: IStatus[] = (await statusStorage.getBulk(uuids)).map((d, i) => (
    d !== undefined ? d : { uuid: uuids[i], value: StatusType.New }
  ));
  if (method.isServerless && (method.api === 'Random')) {
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
  } else {
    // Note: remove the raw content to save space.
    const dataObjects: IDataObject[] = (await (dataObjectStorage as IDataObjectStorage)
      .getAll())
      .map((d) => ({ ...d, content: undefined }));
    const { queryIndices } = (
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
    queryUuids = queryIndices.map((d) => uuids[d]);
  }
  return queryUuids;
});

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
export const interimModelTraining = showProgressBar(async (
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
  const modelUpdated = (
    await axios.post(
      method.api as string,
      JSON.stringify({
        model,
        dataObjects,
        labels,
        statuses,
      }),
    )
  ).data.model;
  return modelUpdated;
});

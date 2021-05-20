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
import {
  dataObjectDB as dataObjectStorage,
  labelDB as labelStorage,
  statusDB as statusStorage,
} from '@/services/database';
import {
  PROTOCOL,
  IP,
  PORT,
} from './http-params';

/**
 * Workflow Component - Data Object Extraction
 * Extract data objects from the data source.
 * @param files the uploaded (image) files.
 * @returns queryIndices - the indices of sampled data objects.
 * @Note The extraction implementation is dependent
 * on the data source type and data object type.
 */
/*
export const dataObjectExtraction = showProgressBar(async (
  input: File | FileList,
  dataType: DataType,
): Promise<IImage[] | IText[]> => {
  if (dataType === DataType.Image) {
    const files = input as FileList;
    const dataObjects = await Promise.all([...files].map(async (file) => {
      const { name } = file;
      const formData = new FormData();
      formData.append('fileToUpload', file);
      formData.append('fileName', name);
      formData.append('key', name);
      const { path, width, height } = (await axios.post(
        `${PROTOCOL}://${IP}:${PORT}/dataObject/image`,
        formData,
      )).data;
      return {
        path,
        width,
        height,
        uuid: uuidv4(),
      };
    })) as IImage[];
    return dataObjects;
  }
  if (dataType === DataType.Text) {
    const file = input as File;
    const dataObjects = (await loadJsonFile(file) as string[]).map((content) => ({
      uuid: uuidv4(),
      content,
    })) as IText[];
    return dataObjects;
  }
  console.warn(`Invalid Data Type: ${dataType}`);
  return [];
});
*/

const getBase64 = (file: File) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = (error) => reject(error);
}) as Promise<string>;

const getImgSize = (content: string) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve({ width: img.width, height: img.height });
  img.onerror = (error) => reject(error);
  img.src = content;
}) as Promise<{ width: number, height: number }>;

export const dataObjectExtraction = showProgressBar(async (
  input: File | FileList,
  dataType: DataType,
): Promise<IDataObjectStorage> => {
  await dataObjectStorage.deleteAll();
  if (dataType === DataType.Image) {
    const files = input as FileList;
    await Promise.all([...files].map(async (file) => {
      const content = await getBase64(file);
      const { width, height } = await getImgSize(content);
      const dataObject: IImage = {
        uuid: uuidv4(),
        content,
        width,
        height,
      };
      dataObjectStorage.add(dataObject);
    }));
  }
  if (dataType === DataType.Text) {
    const file = input as File;
    (await loadJsonFile(file) as string[]).forEach((content) => {
      const dataObject: IText = {
        uuid: uuidv4(),
        content,
      };
      dataObjectStorage.add(dataObject);
    });
  }
  return dataObjectStorage;
});

export const labelInitialization = showProgressBar(async (): Promise<ILabelStorage> => {
  await labelStorage.deleteAll();
  return labelStorage;
});

export const statusInitialization = showProgressBar(async (): Promise<IStatusStorage> => {
  await statusStorage.deleteAll();
  return statusStorage;
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
  dataObjects: IImage[],
  labels: ILabelCategory[] | null = null,
  statuses: StatusType[] | null = null,
): Promise<{ dataObjects: IImage[], featureNames: string[] }> => {
  let response = null;
  if (method.isServerless && (method.api === 'Random3D')) {
    const SEED = '20';
    const random = xor4096(SEED);

    // create a new copy
    const updatedDataObjects = (JSON.parse(JSON.stringify(dataObjects)) as IImage[])
      .map((dataObject) => ({
        ...dataObject,
        // create three random feature values
        features: [random(), random(), random()],
      }));
    const featureNames = [
      'Random[0]',
      'Random[1]',
      'Random[2]',
    ];
    response = {
      dataObjects: updatedDataObjects,
      featureNames,
    };
  } else {
    response = (
      await axios.post(
        method.api as string,
        JSON.stringify({
          dataObjects,
          labels,
          statuses,
        }),
      )
    ).data;
  }
  return {
    dataObjects: response.dataObjects as IImage[],
    featureNames: response.featureNames as string[],
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
  dataObjects: IDataObjectStorage,
  statuses: IStatusStorage,
  nBatch: number,
  model?: ModelService,
): Promise<string[]> => {
  let queryUuids = null;
  const uuids = await dataObjects.uuids();
  const statusValues: IStatus[] = (await statuses.getBulk(uuids)).map((d, i) => (
    d !== undefined ? d : { uuid: uuids[i], value: StatusType.New }
  ));
  if (method.isServerless && (method.api === 'Random')) {
    const SEED = '20';
    const random = xor4096(SEED);
    const uuidsNew = statusValues
      .filter((d) => d.value === StatusType.New)
      .map((d) => d.uuid);
    if (uuidsNew.length >= nBatch) {
      queryUuids = randomChoice(uuidsNew, nBatch, random);
    } else {
      const nResidue = nBatch - uuidsNew.length;
      const uuidsSkipped = statusValues
        .filter((d) => d.value === StatusType.Skipped)
        .map((d) => d.uuid);
      const queryUuidsSkipped = uuidsSkipped.length <= nResidue
        ? uuidsSkipped
        : randomChoice(uuidsSkipped, nResidue, random);
      queryUuids = [...uuidsNew, ...queryUuidsSkipped];
    }
  } else {
    const dataObjectValues: IDataObject[] = (await (dataObjects as IDataObjectStorage)
      .getAll())
      .map((d) => {
        const compressed = { ...d, content: undefined };
        return compressed;
      });
    const { queryIndices } = (
      await axios.post(
        method.api as string,
        JSON.stringify({
          statuses: statusValues.map((d) => d.value),
          nBatch,
          dataObjectValues,
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
  dataObjects: IDataObject[] | null = null,
  labels: ILabelCategory[] | null = null,
  statuses: StatusType[] | null = null,
): Promise<ModelService> => {
  let modelUpdated = null;
  if (method.isBuiltIn && (method.api === 'Static')) {
    modelUpdated = model;
  } else {
    modelUpdated = (
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
  }
  return modelUpdated;
});

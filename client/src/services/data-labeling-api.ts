/**
 * api for communicating with img labeling functions at server
 * @namespace
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import showProgressBar from '@/plugins/nprogress-interceptor';
import {
  IDataObject,
  IImage,
  IModel,
  Label,
  Status,
} from '@/commons/types';
import {
  PROTOCOL,
  IP,
  SERVER_PORT,
} from './http-params';
import uploadFile from './upload-file';

const formatter = (
  port: number,
  funcName: string,
) => `${PROTOCOL}://${IP}:${port}/dataLabeling/${funcName}`;

/**
 * Workflow Component - Data Object Extraction
 * Extract data objects from the data source.
 * @param files the uploaded (image) files.
 * @returns queryIndices - the indices of sampled data objects.
 * @Note The extraction implementation is dependent
 * on the data source type and data object type.
 */
export const extractDataObjects = showProgressBar(async (
  files: FileList,
): Promise<IImage[]> => {
  const dataObjects = await Promise.all([...files].map(async (file) => {
    const { path } = (await uploadFile(file)).data;
    return { path, uuid: uuidv4() };
  })) as IImage[];
  return dataObjects;
});

/**
 * Workflow Component - Feature Extraction
 * Extract features for each data object.
 * @param dataObjects the data objects for which to extract the features.
 * @returns updatedDataObjects - the data objects with extracted features.
 * @Note The extraction implementation is dependent
 * on the data object type.
 */
export const extractFeatures = showProgressBar(async (
  dataObjects: IImage[],
): Promise<{dataObjects: IImage[], featureNames: string[]}> => {
  const response = (
    await axios.post(
      formatter(SERVER_PORT, 'extractFeatures'),
      JSON.stringify({
        dataObjects,
      }),
    )
  ).data;
  const updatedDataObjects = response.dataObjects as IImage[];
  const { featureNames } = response as { featureNames: string[] };
  return {
    dataObjects: updatedDataObjects,
    featureNames,
  };
});

/**
 * Workflow Component - Data Object Sampling (Algorithmic)
 * Sample a batch of data objects from the pool of data objects.
 * @param dataObjects The data objects to be sampled from.
 * @param nBatch The number of data objects to sample.
 * @returns queryIndices - the indices of sampled data objects.
 */
export const sampleDataObjects = showProgressBar(async (
  dataObjects: IDataObject[],
  statuses: Status[],
  nBatch: number,
  model: IModel,
): Promise<number[]> => {
  const { queryIndices } = (
    await axios.post(
      formatter(SERVER_PORT, 'sampleDataObjects'),
      JSON.stringify({
        dataObjects,
        statuses,
        nBatch,
        model,
      }),
    )
  ).data;
  return queryIndices;
});

/**
 * Workflow Component - Default Labeling
 * Assign default labels to a batch of data objects (for the user to verify).
 * @param dataObjects The data objects to be assigned default labels.
 * @param model The default labeling model.
 * @returns defaultLabels - the default labels of the selected data objects.
 */
export const assignDefaultLabels = showProgressBar(async (
  dataObjects: IDataObject[],
  model: IModel,
  classes: Label[],
  unlabeledMark: Label,
): Promise<Label[]> => {
  const { defaultLabels } = (
    await axios.post(
      formatter(SERVER_PORT, 'assignDefaultLabels'),
      JSON.stringify({
        dataObjects,
        model,
        classes,
        unlabeledMark,
      }),
    )
  ).data;
  return defaultLabels;
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
export const updateModel = showProgressBar(async (
  dataObjects: IDataObject[],
  labels: Label[],
  statuses: Status[],
  model: IModel,
): Promise<IModel> => {
  const modelUpdated = (
    await axios.post(
      formatter(SERVER_PORT, 'updateModel'),
      JSON.stringify({
        dataObjects,
        labels,
        statuses,
        model,
      }),
    )
  ).data.model;
  return modelUpdated;
});

/**
 * api for communicating with img labeling functions at server
 * @namespace
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { xor4096 } from 'seedrandom';
import showProgressBar from '@/plugins/nprogress-interceptor';
import {
  IDataObject,
  IImage,
  IModel,
  Label,
  Status,
  FeatureExtractionMethod,
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
  method: FeatureExtractionMethod,
  dataObjects: IImage[],
  labels: Label[] | null = null,
  statuses: Status[] | null = null,
): Promise<{dataObjects: IImage[], featureNames: string[]}> => {
  let response = null;
  if (method.serverless) {
    if (method.api === 'Random3D') {
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
    }
  } else {
    response = (
      await axios.post(
        method.api,
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
 * Workflow Component - Data Object Sampling (Algorithmic)
 * Sample a batch of data objects from the pool of data objects.
 * @param dataObjects The data objects to be sampled from.
 * @param labels The labels of the data objects.
 * @param nBatch The number of data objects to sample.
 * @returns queryIndices - the indices of sampled data objects.
 */
export const sampleDataObjects = showProgressBar(async (
  dataObjects: IDataObject[],
  labels: Label[],
  statuses: Status[],
  nBatch: number,
  model: IModel,
): Promise<number[]> => {
  const { queryIndices } = (
    await axios.post(
      formatter(SERVER_PORT, 'sampleDataObjects'),
      JSON.stringify({
        dataObjects,
        labels,
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

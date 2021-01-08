/**
 * api for communicating with img labeling functions at server
 * @namespace
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import showProgressBar from '@/plugins/nprogress-interceptor';
import { IImage, Status } from '@/types';
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
 * Workflow Component - Data Object Sampling
 * Sample a batch of data objects from the pool of data objects.
 * @param dataObjects The data objects to be sampled from.
 * @param nBatch The number of data objects to sample.
 * @returns queryIndices - the indices of sampled data objects.
 */
export const sampleDataObjects = showProgressBar(async (
  dataObjects: IImage[],
  statuses: Status[],
  nBatch: number,
): Promise<number[]> => {
  const { queryIndices } = (
    await axios.post(
      formatter(SERVER_PORT, 'sampleDataObjects'),
      JSON.stringify({
        dataObjects,
        statuses,
        nBatch,
      }),
    )
  ).data;
  return queryIndices;
});

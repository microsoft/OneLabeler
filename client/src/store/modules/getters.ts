import { scaleOrdinal, schemeCategory10, ScaleOrdinal } from 'd3';
import {
  IDataObject,
  ILabel,
  IStatus,
} from '@/commons/types';
import { IState } from './state';

export const featureValues = (state: IState): number[][] | undefined[] => {
  const { dataObjects } = state;
  return dataObjects.map((dataObject: IDataObject) => {
    if ('features' in dataObject) {
      return dataObject.features as number[];
    }
    return undefined;
  }) as number[][] | undefined[];
};

export const uuids = (state: IState): string[] => {
  const { dataObjects } = state;
  return dataObjects.map((d: IDataObject) => d.uuid);
};

export const sampledDataObjects = (state: IState): IDataObject[] => {
  const { dataObjects, queryUuids } = state;
  return queryUuids.map((uuid: string) => dataObjects.find((d) => d.uuid === uuid) as IDataObject);
};

export const sampledStatuses = (state: IState): IStatus[] => {
  const { statuses, queryUuids } = state;
  return queryUuids.map((uuid) => statuses.find((d) => d.uuid === uuid) as IStatus);
};

export const sampledLabels = (state: IState): ILabel[] => {
  const { labels, queryUuids } = state;
  return queryUuids.map((uuid: string) => labels.find((d) => d.uuid === uuid) as ILabel);
};

/** The color scale for labels used in the system.  */
export const label2color = (
  state: IState,
): ScaleOrdinal<string, string, never> => {
  const { classes, unlabeledMark } = state;
  const mapper = scaleOrdinal(['#bbbbbb', ...schemeCategory10])
    .domain([unlabeledMark, ...classes]);
  return mapper;
};

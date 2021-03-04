import { scaleOrdinal, schemeCategory10 } from 'd3';
import {
  IDataObject,
  ILabelPolygon,
  ILabelMask,
  Label,
  Status,
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
  const { dataObjects, queryIndices } = state;
  return queryIndices.map((index: number) => dataObjects[index]);
};

export const sampledDataObjectLabels = (state: IState): Label[] => {
  const { labels, queryIndices } = state;
  return queryIndices.map((index: number) => labels[index]);
};

export const sampledDataObjectLabelPolygons = (state: IState): ILabelPolygon[][] => {
  const { labelPolygons, queryIndices } = state;
  return queryIndices.map((index: number) => labelPolygons[index]);
};

export const sampledDataObjectLabelMasks = (state: IState): ILabelMask[] => {
  const { labelMasks, queryIndices } = state;
  return queryIndices.map((index: number) => labelMasks[index]);
};

export const unlabeledIndices = (state: IState): number[] => {
  const { statuses } = state;
  return statuses.reduce((arr: number[], d: Status, i: number) => {
    if (d !== Status.LABELED) {
      arr.push(i);
    }
    return arr;
  }, []);
};

/** The color scale for labels used in the system.  */
export const label2color = (state: IState) => {
  const { classes, unlabeledMark } = state;
  const mapper = scaleOrdinal(['#bbbbbb', ...schemeCategory10])
    .domain([unlabeledMark, ...classes]);
  return mapper;
};

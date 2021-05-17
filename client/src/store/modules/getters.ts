import { scaleOrdinal, schemeCategory10, ScaleOrdinal } from 'd3';
import {
  IDataObject,
  ILabel,
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
  const { dataObjects, queryUuids } = state;
  return dataObjects.filter((d) => queryUuids.includes(d.uuid));
};

export const sampledStatuses = (state: IState): Status[] => {
  const { statuses, dataObjects, queryUuids } = state;
  const queryIndices = queryUuids.map((uuid) => (
    dataObjects.findIndex((d) => d.uuid === uuid)
  ));
  return queryIndices.map((index: number) => statuses[index]);
};

export const sampledLabels = (state: IState): ILabel[] | null => {
  const { labels, dataObjects, queryUuids } = state;
  if (labels === null) return null;
  const queryIndices = queryUuids.map((uuid) => (
    dataObjects.findIndex((d) => d.uuid === uuid)
  ));
  return queryIndices.map((index: number) => labels[index]);
};

export const unlabeledIndices = (state: IState): number[] => {
  const { statuses } = state;
  return statuses.reduce((arr: number[], d: Status, i: number) => {
    if (d !== Status.Labeled) {
      arr.push(i);
    }
    return arr;
  }, []);
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

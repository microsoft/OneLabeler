import { scaleOrdinal, schemeCategory10, ScaleOrdinal } from 'd3';
import {
  IDataObject,
  ILabelShape,
  ILabelMask,
  ILabelCategory,
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

export const sampledStatuses = (state: IState): Status[] => {
  const { statuses, queryIndices } = state;
  return queryIndices.map((index: number) => statuses[index]);
};

export const sampledLabels = (state: IState): ILabelCategory[] | null => {
  const { labels, queryIndices } = state;
  if (labels === null) return null;
  return queryIndices.map((index: number) => labels[index]);
};

export const sampledLabelShapeLists = (
  state: IState,
): ILabelShape[][] | null => {
  const { labelShapeLists, queryIndices } = state;
  if (labelShapeLists === null) return null;
  return queryIndices.map((index: number) => labelShapeLists[index]);
};

export const sampledLabelMasks = (state: IState): ILabelMask[] | null => {
  const { labelMasks, queryIndices } = state;
  if (labelMasks === null) return null;
  return queryIndices.map((index: number) => labelMasks[index]);
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

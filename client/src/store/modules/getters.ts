import { IDataObject, Label, Status } from '@/types';
import { State } from './types';

export const featureValues = (state: State): number[][] | undefined[] => {
  const { dataObjects } = state;
  return dataObjects.map((dataObject: IDataObject) => {
    if ('features' in dataObject) {
      return dataObject.features as number[];
    }
    return undefined;
  }) as number[][] | undefined[];
};

export const sampledDataObjects = (state: State): IDataObject[] => {
  const { dataObjects, queryIndices } = state;
  return queryIndices.map((index: number) => dataObjects[index]);
};

export const sampledDataObjectLabels = (state: State): Label[] => {
  const { labels, queryIndices } = state;
  return queryIndices.map((index: number) => labels[index]);
};

export const unlabeledIndices = (state: State): number[] => {
  const { statuses } = state;
  return statuses.reduce((arr: number[], d: Status, i: number) => {
    if (d !== Status.LABELED) {
      arr.push(i);
    }
    return arr;
  }, []);
};

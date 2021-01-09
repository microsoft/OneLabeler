import { IDataObject, Label, Status } from '@/commons/types';
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

export const sampledDataObjects = (state: IState): IDataObject[] => {
  const { dataObjects, queryIndices } = state;
  return queryIndices.map((index: number) => dataObjects[index]);
};

export const sampledDataObjectLabels = (state: IState): Label[] => {
  const { labels, queryIndices } = state;
  return queryIndices.map((index: number) => labels[index]);
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

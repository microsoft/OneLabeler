import {
  ICommand, IImage, Label, Status,
} from '@/types';

export interface State {
  dataObjects: IImage[],
  labels: Label[],
  classes: Label[],
  queryIndices: number[],
  statuses: Status[],
  unlabeledMark: Label,
  nBatch: number,
  queryStrategy: string,
  commandHistory: ICommand[],
  featureNames: string[],
}

import { Label } from '@/commons/types';

export interface IState {
  classes: Label[],
  showDatasetOverview: boolean,
  queryStrategy: string,
  nBatch: number,
  itemsPerRow: number,
  itemsPerCol: number,
}

export default {
  /** The data labeling workflow configuration parameters. */
  /** The label category options. */
  classes: [],
  /** Whether to show the dataset overview. */
  showDatasetOverview: false,
  /** The data sampling strategy. */
  queryStrategy: 'random',
  /** The number of data objects to sample each time. */
  nBatch: 32,
  /** The number of data objects per row in the thumbnail matrix. */
  itemsPerRow: 8,
  /** The number of data objects per column in the thumbnail matrix. */
  itemsPerCol: 4,
} as IState;

export default {
  dataObjects: [], // the data objects to be labeled
  labels: [], // the data object labels
  classes: [], // the label options
  queryIndices: [], // the indices of sampled data objects
  statuses: [], // the label statuses of the data objects
  unlabeledMark: -1, // the label mark of unlabeled data objects
  nBatch: 32, // the number of data objects to sample each time
  queryStrategy: 'random', // the sample strategy for determining which data objects to label for the next batch
  commandHistory: [], // the history of label editing commands (used to support undo command)
  featureNames: [], // the names of data object features
};

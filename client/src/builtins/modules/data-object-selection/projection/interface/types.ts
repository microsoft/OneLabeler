// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** The type of binning configuration. */
export type Binning = {
  enabled: boolean,
  nRows: number,
  nColumns: number,
}

/** The type of subsampling configuration. */
export type Subsampling = {
  enabled: boolean,
  nSamples: number,
}

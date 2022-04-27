// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import showProgressBar from '@/plugins/nprogress-interceptor';
import { ALGORITHM_URL } from '@/services/http-params';

const formatter = (funcName: string) => `${ALGORITHM_URL}/projection/${funcName}`;

export const PCA = showProgressBar(async (
  X: number[][],
  nComponents: number,
): Promise<number[][]> => {
  const { projection } = (
    await axios.post(
      formatter('PCA'),
      JSON.stringify({ X, nComponents }),
    )
  ).data as { projection: number[][] };
  return projection;
});

export const MDS = showProgressBar(async (
  X: number[][],
  nComponents: number,
): Promise<number[][]> => {
  const { projection } = (
    await axios.post(
      formatter('MDS'),
      JSON.stringify({ X, nComponents }),
    )
  ).data as { projection: number[][] };
  return projection;
});

export const TSNE = showProgressBar(async (
  X: number[][],
  nComponents: number,
): Promise<number[][]> => {
  const { projection } = (
    await axios.post(
      formatter('TSNE'),
      JSON.stringify({ X, nComponents }),
    )
  ).data as { projection: number[][] };
  return projection;
});

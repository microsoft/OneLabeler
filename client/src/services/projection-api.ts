import axios from 'axios';
import showProgressBar from '@/plugins/nprogress-interceptor';
import {
  PROTOCOL_ALGO,
  IP_ALGO,
  PORT_ALGO,
} from './http-params';

const formatter = (
  port: number,
  funcName: string,
) => `${PROTOCOL_ALGO}://${IP_ALGO}:${port}/projection/${funcName}`;

export const PCA = showProgressBar(async (
  X: number[][],
  nComponents: number,
): Promise<number[][]> => {
  const { projection } = (
    await axios.post(
      formatter(PORT_ALGO, 'PCA'),
      JSON.stringify({ X, nComponents }),
    )
  ).data;
  return projection;
});

export const MDS = showProgressBar(async (
  X: number[][],
  nComponents: number,
): Promise<number[][]> => {
  const { projection } = (
    await axios.post(
      formatter(PORT_ALGO, 'MDS'),
      JSON.stringify({ X, nComponents }),
    )
  ).data;
  return projection;
});

export const TSNE = showProgressBar(async (
  X: number[][],
  nComponents: number,
): Promise<number[][]> => {
  const { projection } = (
    await axios.post(
      formatter(PORT_ALGO, 'TSNE'),
      JSON.stringify({ X, nComponents }),
    )
  ).data;
  return projection;
});

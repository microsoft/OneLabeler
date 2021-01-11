import axios from 'axios';
import showProgressBar from '@/plugins/nprogress-interceptor';
import {
  PROTOCOL,
  IP,
  SERVER_PORT,
} from './http-params';

const formatter = (
  port: number,
  funcName: string,
) => `${PROTOCOL}://${IP}:${port}/projection/${funcName}`;

export const PCA = showProgressBar(async (
  X: number[][],
  nComponents: number,
): Promise<number[][]> => {
  const { projection } = (
    await axios.post(
      formatter(SERVER_PORT, 'PCA'),
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
      formatter(SERVER_PORT, 'MDS'),
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
      formatter(SERVER_PORT, 'TSNE'),
      JSON.stringify({ X, nComponents }),
    )
  ).data;
  return projection;
});
import axios from 'axios';
import { ALGORITHM_URL, DATABASE_URL } from '@/services/http-params';
import socket from './jupyter-api-plugin';

export const getAlgorithmServerLatency = async (): Promise<number> => {
  const startTime = Date.now();
  let connected = true;
  await axios.post(`${ALGORITHM_URL}/roundtrip`)
    .catch(() => { connected = false; });
  const latency = connected ? Date.now() - startTime : Infinity;
  return latency;
};

export const getDatabaseServerLatency = async (): Promise<number> => {
  const startTime = Date.now();
  let connected = true;
  await axios.post(`${DATABASE_URL}/roundtrip`)
    .catch(() => { connected = false; });
  const latency = connected ? Date.now() - startTime : Infinity;
  return latency;
};

export const getPythonApiServerLatency = async (): Promise<number> => (
  socket.getLatency()
);

import axios from 'axios';
import {
  PROTOCOL_ALGO,
  PROTOCOL_DB,
  IP_ALGO,
  IP_DB,
  PORT_ALGO,
  PORT_DB,
} from './http-params';
import socket from './jupyter-api-plugin';

export const getAlgorithmServerLatency = async (): Promise<number> => {
  const startTime = Date.now();
  let connected = true;
  await axios.post(`${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/roundtrip`)
    .catch(() => { connected = false; });
  const latency = connected ? Date.now() - startTime : Infinity;
  return latency;
};

export const getDatabaseServerLatency = async (): Promise<number> => {
  const startTime = Date.now();
  let connected = true;
  await axios.post(`${PROTOCOL_DB}://${IP_DB}:${PORT_DB}/roundtrip`)
    .catch(() => { connected = false; });
  const latency = connected ? Date.now() - startTime : Infinity;
  return latency;
};

export const getPythonApiServerLatency = async (): Promise<number> => (
  socket.getLatency()
);

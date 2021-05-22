import axios, { AxiosResponse } from 'axios';
import {
  PROTOCOL_ALGO,
  IP_ALGO,
  PORT_ALGO,
} from './http-params';

export default async function uploadFile(file: File): Promise<AxiosResponse<{ path: string }>> {
  const { name } = file;
  const formData = new FormData();
  formData.append('fileToUpload', file);
  formData.append('fileName', name);
  formData.append('key', name);

  return axios.post(
    `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/uploadFile`,
    formData,
  );
}

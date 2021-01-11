import axios, { AxiosResponse } from 'axios';
import {
  PROTOCOL,
  IP,
  SERVER_PORT,
} from './http-params';

export default async function uploadFile(file: File): Promise<AxiosResponse<{ path: string }>> {
  const { name } = file;
  const formData = new FormData();
  formData.append('fileToUpload', file);
  formData.append('fileName', name);
  formData.append('key', name);

  return axios.post(
    `${PROTOCOL}://${IP}:${SERVER_PORT}/uploadFile`,
    formData,
  );
}
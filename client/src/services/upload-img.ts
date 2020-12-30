import axios, { AxiosResponse } from 'axios';
import {
  PROTOCOL,
  IP,
  SERVER_PORT,
} from './http-params';

export default async function uploadImg(file: File): Promise<AxiosResponse<{ imgPath: string }>> {
  const { name } = file;
  const formData = new FormData();
  formData.append('fileToUpload', file);
  formData.append('fileName', name);
  formData.append('key', name);

  return axios.post(
    `${PROTOCOL}://${IP}:${SERVER_PORT}/uploadimg`,
    formData,
  );
}

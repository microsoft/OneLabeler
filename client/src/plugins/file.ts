import axios, { AxiosResponse } from 'axios';

export const getBase64 = (
  file: File,
): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = (error) => reject(error);
});

export const upload = async (
  file: File,
  url: string,
): Promise<AxiosResponse<{ path: string }>> => {
  const { name } = file;
  const formData = new FormData();
  formData.append('fileToUpload', file);
  formData.append('fileName', name);
  formData.append('key', name);
  return axios.post(url, formData);
};

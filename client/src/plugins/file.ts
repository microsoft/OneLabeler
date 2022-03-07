import axios, { AxiosResponse } from 'axios';
import { csvParse } from 'd3';
import { saveAs } from 'file-saver';

export const getBase64 = (
  file: File | Blob,
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

export const saveJsonFile = (
  data: unknown,
  filename: string,
): void => {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, filename);
};

export const parseJsonFile = (file: File): Promise<unknown> => {
  const promise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const { result } = event.target as FileReader;
      const parsedObject = JSON.parse(result as string) as unknown;
      resolve(parsedObject);
    };
    reader.readAsText(file);
  }) as Promise<unknown>;
  return promise;
};

export const parseCsvFile = (file: File): Promise<unknown> => {
  const promise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const { result } = event.target as FileReader;
      const parsedObject = csvParse(result as string) as unknown;
      resolve(parsedObject);
    };
    reader.readAsText(file);
  }) as Promise<unknown>;
  return promise;
};

export const canvasToFile = async (
  canvas: HTMLCanvasElement,
  filename: string,
): Promise<File> => new Promise((resolve): void => {
  canvas.toBlob((blob: Blob | null): void => {
    if (blob === null) return;
    const file = new File(
      [blob],
      filename,
      { type: blob.type },
    );
    resolve(file);
  });
});

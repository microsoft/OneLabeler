// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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

export const saveJsonFileAsync = async (
  data: unknown,
  filename: string,
  overwrite = false,
): Promise<string> => {
  const { ipcRenderer } = window.require('electron');
  const json = JSON.stringify(data);

  if (overwrite) {
    await ipcRenderer.invoke('saveFile', { file: filename, content: json });
    return '';
  }

  const filePath = await ipcRenderer.invoke('callSaveFileDialog', { file: filename, content: json });
  return filePath;

  //   const path = window.require('path');
  //   try {
  //     // https://stackoverflow.com/questions/59477396/typeerror-fs-existssync-is-not-a-function-reactjs-and-electron
  //     const { dialog } = window.require('@electron/remote');
  //     const saveOptions = {
  //       title: 'Select the File Path to save',
  //       defaultPath: path.join(__dirname, filename),
  //       buttonLabel: 'Save',
  //       filters: [
  //         {
  //           name: 'Json Files',
  //           extensions: ['json'],
  //         }],
  //       properties: [],
  //     };

  //     const saveFilePath = dialog.showSaveDialogSync(saveOptions);
  //     if (saveFilePath) {
  //       console.log(saveFilePath);
  //     }
  //   } catch (e) {
  //   }
  // }
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

export const parseLocalJsonFile = async (file: string): Promise<any> => {
  const { ipcRenderer } = window.require('electron');
  const content = await ipcRenderer.invoke('getFileContent', file) as string;
  const parsedObject = JSON.parse(content);
  return parsedObject;
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

export const getDirectory = (path: string): string => {
  if (!path) {
    return path;
  }

  let pos = path.lastIndexOf('\\');
  if (pos === -1) {
    pos = path.lastIndexOf('/');
  }

  if (pos === -1) {
    throw new Error(`invalid path - ${path}`);
  }

  return path.substring(0, pos);
};

export const getFile = (path: string): string => {
  if (!path) {
    return path;
  }

  let pos = path.lastIndexOf('\\');
  if (pos === -1) {
    pos = path.lastIndexOf('/');
  }

  if (pos === -1) {
    return path;
  }

  return path.substring(pos + 1);
};

export const getFileWithoutExtension = (path: string): string => {
  if (!path) {
    return path;
  }

  let pos = path.lastIndexOf('\\');
  if (pos === -1) {
    pos = path.lastIndexOf('/');
  }

  let path2 = path;
  if (pos > -1) {
    path2 = path2.substring(pos + 1);
  }

  pos = path2.lastIndexOf('.');
  return path2.substring(0, pos);
};

export const getWorkflowFileFromProjectFile = (path: string): string => {
  if (!path) {
    return path;
  }

  const directory = getDirectory(path);
  const fileWithoutExtension = getFileWithoutExtension(path);
  if (directory) {
    return `${directory}\\${fileWithoutExtension}.workflow.json`;
  }

  return `${fileWithoutExtension}.workflow.json`;
};

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WorkMode } from '../components/TheNavBarView/load-project';

const { ipcMain, dialog } = require("electron");
const path = require('path');

export let workMode: WorkMode;

export const registerNativeService = (): void => {
  ipcMain.handle("callSaveFileDialog", (e, eventArg) => {
    return saveFileDialog(eventArg.file);
  });

  ipcMain.handle("saveFile", (e, eventArg) => {
    return saveFile(eventArg.content, eventArg.file);
  });

  ipcMain.handle("getFileContent", (e, eventArg) => {
    return getFileContent(eventArg);
  });

  ipcMain.handle("workModeChange", (e, eventArg) => {
    return setWorkMode(eventArg.workMode);
  });

  // More service here.
};

const saveFileDialog = (
  filename: string,
): any => {
  const saveOptions = {
    title: 'Select the File Path to save',
    defaultPath: path.join(__dirname, filename),
    buttonLabel: 'Save',
    filters: [
      {
        name: 'Json Files',
        extensions: ['json'],
      }],
    properties: [],
  };
  const saveFilePath = dialog.showSaveDialogSync(saveOptions);
  return saveFilePath;
};

const saveFile = (
  json: string,
  filename: string,
): any => {
  const fs = require('fs');
  fs.writeFileSync(filename, json);
};

const getFileContent = (
  file: string,
): string => {
  const fs = require('fs');
  const content = fs.readFileSync(file, {encoding:'utf8', flag:'r'}) as string;
  return content;
};

const setWorkMode = (
  mode: WorkMode,
): void => {
  workMode = mode;
};

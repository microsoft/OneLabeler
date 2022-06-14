// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { ipcMain, dialog } = require("electron");
const path = require('path');

export const registerNativeService = (): void => {
  ipcMain.handle("callSaveFileDialog", (e, eventArg) => {
    return saveFileDialog(eventArg.content, eventArg.file);
  });

  ipcMain.handle("saveFile", (e, eventArg) => {
    return saveFile(eventArg.content, eventArg.file);
  });

  ipcMain.handle("getFileContent", (e, eventArg) => {
    return getFileContent(eventArg);
  });

  // More service here.
};

const saveFileDialog = (
  json: string,
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
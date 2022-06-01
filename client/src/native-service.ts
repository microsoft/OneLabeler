// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { ipcMain, dialog } = require("electron");
const path = require('path');

export const registerNativeService = (): void => {
  ipcMain.handle("callSaveFileDialog", (e, eventArg) => {
    return saveFile(eventArg.content, eventArg.file);
  });

  // More service here.
};

const saveFile = (
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
  if (saveFilePath) {
    const fs = require('fs');
    fs.writeFileSync(saveFilePath, json);
    return saveFilePath;
  }
};

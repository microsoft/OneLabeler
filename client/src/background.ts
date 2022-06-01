// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { app, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import * as remoteMain from '@electron/remote/main';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Standard scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    standard: true,
    secure: true,
    supportFetchAPI: true,
  },
}]);

const path = require('path');
const { ipcMain, dialog } = require("electron");

ipcMain.handle("showDialog", (e, message) => {
  console.log('showDialog message received');
  const filename = message;
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
    console.log(saveFilePath);
    return saveFilePath;
  }
  return null;
});

declare const __static: string;

const createWindow = (): void => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // https://stackoverflow.com/questions/60814430/electron-builder-with-browserwindow-and-preload-js-unable-to-load-preload-scrip
      preload: path.join(__static, "preload.js"),
      // https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/1234
      // https://github.com/electron/electron/issues/11608
      nodeIntegration: true,
      contextIsolation: false,
  }});

  // remove default menu
  win.setMenu(null);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('close', (event): void => {
    const dialog = require('electron').dialog;
    const options = {
      type: 'question',
      buttons: ['Yes', 'No'],
      defaultId: 1,
      title: 'OneLabeler',
      message: 'Please make sure you have saved your data. Do you want to close OneLabeler now?',
    };
  
    if (dialog.showMessageBoxSync(options) === 0) {
      win = null;
    } else {
      event.preventDefault();
    }
  });

  remoteMain.initialize();
  remoteMain.enable(win.webContents);

  // console.log(`Running in Electron? ${window.isElectron}`);
};

// Quit when all windows are closed.
app.on('window-all-closed', (): void => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', (): void => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async (): Promise<void> => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', (e as Error).toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data): void => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', (): void => {
      app.quit();
    });
  }
}

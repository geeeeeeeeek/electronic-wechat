'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    title: 'WeChat',
    width: 800,
    height: 600,
    resizable: true,
    center: true,
    show: true,
    frame: true,
    icon: 'icon.png'
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  mainWindow.webContents.on('will-navigate', ev => {
    ev.preventDefault();
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
    app.quit();
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

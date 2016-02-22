'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;
const session = require('electron').session;
const ipcMain = electron.ipcMain;

let windows = {};

let createWindow = () => {
  let name = (new Date()).getTime();

  windows[name] = new BrowserWindow({
    title: 'WeChat',
    width: 800,
    height: 600,
    resizable: true,
    center: true,
    show: true,
    frame: true,
    icon: 'icon.png',
  });

  // windows[name].webContents.openDevTools();

  windows[name].loadURL('file://' + __dirname + '/index.html');

  windows[name].webContents.on('will-navigate', (ev) => {
    ev.preventDefault();
  });

  windows[name].on('closed', () => {
    windows[name] = null;
  });


  // try {
  //   windows[name].webContents.debugger.attach("1.1");
  // } catch(err) {
  //   console.log("Debugger attach failed : ", err);
  // };
  //
  // windows[name].webContents.debugger.on('detach', function(event, reason) {
  //   console.log("Debugger detached due to : ", reason);
  // });
  //
  // windows[name].webContents.debugger.on('message', function(event, method, params) {
  //   if (method == "Network.responseReceived") {
  //     console.log(method);
  //     message.handleEmojiMessage(params.response);
  //   }
  // });
  //
  // windows[name].webContents.debugger.sendCommand("Network.enable");
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (Object.keys(windows).length == 0) {
    createWindow();
  }
});

ipcMain.on('badge-changed', (event, num) => {
  app.dock.setBadge(num);
});

ipcMain.on('log', (event, msg) => {
  console.log(msg);;
});

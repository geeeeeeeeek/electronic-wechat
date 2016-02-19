'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;
const session = require('electron').session;

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

  windows[name].on('closed', ()=> {
    windows[name] = null;
  });

  // globalShortcut.register('CommandOrControl+N', () => {
  //   createWindow();
  // });

  // let ses = windows[name].webContents.session;
  // ses.cookies.remove("https://wx.qq.com", "wxuin", ()=>{})
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (Object.keys(windows).length == 0) {
    createWindow();
  }
});

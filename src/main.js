/* eslint-disable */
'use strict';

const path = require('path');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const shell = electron.shell;
const Menu = electron.Menu;

const injectBundle = require('./inject-onload.js');
const messageHandler = require('./message.js');

const WINDOW_SIZE = { width: 800, height: 600 };
const WINDOW_SIZE_LOGIN = { width: 380, height: 540 };

const WINDOW_TITLE = 'Electronic WeChat';

let browserWindow = null;
let appIcon = null;

let createWindow = () => {
  browserWindow = new BrowserWindow({
    title: WINDOW_TITLE,
    resizable: true,
    center: true,
    show: true,
    frame: true,
    autoHideMenuBar: true,
    icon: 'assets/icon.png',
    titleBarStyle: 'hidden-inset',
    'web-preferences': {
      javascript: true,
      plugins: true,
      nodeIntegration: false,
      webSecurity: false,
      preload: __dirname + '/inject-preload.js'
    }
  });

  browserWindow.webContents.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36");
  // browserWindow.webContents.openDevTools();

  browserWindow.loadURL("https://wx.qq.com/");

  browserWindow.webContents.on('will-navigate', (ev, url) => {
    if (/(.*wx.*\.qq\.com.*)|(web.*\.wechat\.com.*)/.test(url)) return;
    ev.preventDefault();
  });

  browserWindow.on('close', (e) => {
    if (browserWindow.isVisible()) {
      e.preventDefault();
      browserWindow.hide();
    }
  });

  browserWindow.on('closed', () => {
    browserWindow = null;
    appIcon.destroy();
    appIcon = null;
  });

  browserWindow.on('page-title-updated', (ev) => {
    ev.preventDefault();
  });

  browserWindow.webContents.on('dom-ready', () => {
    browserWindow.webContents.insertCSS(injectBundle.wechatCSS);
    if (process.platform == "darwin") {
      browserWindow.webContents.insertCSS(injectBundle.osxCSS);
    }
    browserWindow.webContents.executeJavaScript(`injectBundle.getBadgeJS()`);
  });

  browserWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(messageHandler.handleRedirectMessage(url));
  });

  browserWindow.hide();

  createTray();
};

app.on('ready', createWindow);

app.on('activate', () => {
  if (browserWindow == null) {
    createWindow();
  } else {
    browserWindow.show();
  }
});

ipcMain.on('badge-changed', (event, num) => {
  if (process.platform == "darwin") {
    app.dock.setBadge(num);
    if (num) appIcon.setTitle(` ${num}`);
    else appIcon.setTitle('');
  }
});

ipcMain.on('user-logined', () => renderWindow(true));

ipcMain.on('wx-rendered', (event, isLogined) => renderWindow(isLogined));

ipcMain.on('log', (event, message) => {
  console.log(message);
});

ipcMain.on('reload', (event, message) => {
  browserWindow.loadURL("https://wx.qq.com/");
});

let setResizable = (isLogined) => {
  browserWindow.setResizable(isLogined);
};

let setSize = (isLogined) => {
  const size = isLogined ? WINDOW_SIZE : WINDOW_SIZE_LOGIN;
  browserWindow.setSize(size.width, size.height);
  browserWindow.center();
  browserWindow.show();
};

let renderWindow = (isLogined) => {
  setResizable(isLogined);
  setSize(isLogined);
}

let createTray = () => {
  const nativeImage = require('electron').nativeImage;
  let image = nativeImage.createFromPath(path.join(__dirname, '../assets/status_bar.png'));
  image.setTemplateImage(true);

  appIcon = new electron.Tray(image);
  appIcon.setToolTip('Electronic WeChat');

  if (process.platform == "linux") {
    let contextMenu = Menu.buildFromTemplate([
      {label: 'Show', click: () => browserWindow.show()},
      {label: 'Exit', click: () => app.exit(0)}
    ]);
    appIcon.setContextMenu(contextMenu);
  } else {
    appIcon.on('click', () => browserWindow.show());
  }
};

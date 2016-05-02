/* eslint-disable */
'use strict';

const path = require('path');
const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const Menu = electron.Menu;
const nativeImage = electron.nativeImage;

const UpdateHandler = require('./handlers/update');
const Common = require('./common');

const SplashWindow = require('./windows/controllers/splash');
const WeChatWindow = require('./windows/controllers/wechat');

class ElectronicWeChat {
  constructor() {
    this.wechatWindow = null;
    this.splashWindow = null;
    this.tray = null;
    this.logged = null;
  }

  init() {
    this.initApp();
    this.initIPC();
  }

  initApp() {
    app.on('ready', ()=> {
      this.createSplashWindow();
      this.createWeChatWindow();
      this.createTray();
    });

    app.on('activate', () => {
      if (this.wechatWindow == null) {
        this.createWeChatWindow();
      } else {
        this.wechatWindow.show();
      }
    });
  };

  initIPC() {
    ipcMain.on('badge-changed', (event, num) => {
      if (process.platform == "darwin") {
        app.dock.setBadge(num);
        if (num) {
          this.tray.setTitle(` ${num}`);
        } else {
          this.tray.setTitle('');
        }
      }
    });

    ipcMain.on('user-logged', () => this.wechatWindow.resizeWindow(true, this.splashWindow));

    ipcMain.on('wx-rendered', (event, isLogged) => this.wechatWindow.resizeWindow(isLogged, this.splashWindow));

    ipcMain.on('log', (event, message) => {
      console.log(message);
    });

    ipcMain.on('reload', (event, message) => {
      this.wechatWindow.loadURL(Common.WEB_WECHAT);
    });

    ipcMain.on('update', (event, message) => {
      let updateHandler = new UpdateHandler();
      updateHandler.checkForUpdate(`v${app.getVersion()}`, false);
    });
  };

  createTray() {
    let image;
    if (process.platform == "linux") {
      image = nativeImage.createFromPath(path.join(__dirname, '../assets/icon.png'));
    } else {
      image = nativeImage.createFromPath(path.join(__dirname, '../assets/status_bar.png'));
    }
    image.setTemplateImage(true);

    this.tray = new electron.Tray(image);
    this.tray.setToolTip(Common.ELECTRONIC_WECHAT);

    if (process.platform == "linux") {
      let contextMenu = Menu.buildFromTemplate([
        {
          label: 'Show', click: () => {
          if (this.splashWindow.isShown) return;
          this.wechatWindow.show();
        }
        },
        {label: 'Exit', click: () => app.exit(0)}
      ]);
      this.tray.setContextMenu(contextMenu);
    } else {
      this.tray.on('click', () => {
        if (this.splashWindow.isShown) return;
        this.wechatWindow.show();
      });
    }
  }

  createSplashWindow() {
    this.splashWindow = new SplashWindow();
    this.splashWindow.show();
  }

  createWeChatWindow() {
    this.wechatWindow = new WeChatWindow();
  }
}

new ElectronicWeChat().init();

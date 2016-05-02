/**
 * Created by Zhongyi on 5/1/16.
 */
"use strict";

const path = require('path');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Common = require('../../common');

class SplashWindow {
  init() {
    this.browserWindow = new BrowserWindow({
      width: Common.WINDOW_SIZE_LOADING.width,
      height: Common.WINDOW_SIZE_LOADING.height,
      title: Common.ELECTRONIC_WECHAT,
      resizable: false,
      center: true,
      show: true,
      frame: false,
      autoHideMenuBar: true,
      alwaysOnTop: true,
      icon: 'assets/icon.png',
      titleBarStyle: 'hidden'
    });

    this.browserWindow.loadURL('file://' + __dirname + '/../views/splash.html');
    this.isShown = false;
  }

  show() {
    this.browserWindow.show();
    this.isShown = true;
  }

  hide() {
    this.browserWindow.hide();
    this.isShown = false;
  }
}

module.exports = SplashWindow;
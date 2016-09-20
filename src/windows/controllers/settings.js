/**
 * Created by Ji on 9/15/16.
 */
'use strict';

const path = require('path');
const { BrowserWindow } = require('electron');
const Common = require('../../common');

class SettingsWindow {
  constructor() {
    this.settingsWindow = new BrowserWindow({
      width: Common.WINDOW_SIZE_SETTINGS.width,
      height: Common.WINDOW_SIZE_SETTINGS.height,
      title: Common.ELECTRONIC_WECHAT,
      resizable: false,
      center: true,
      show: false,
      frame: false,
      autoHideMenuBar: true,
      alwaysOnTop: true,
      icon: 'assets/icon.png',
      titleBarStyle: 'hidden',
    });
    this.settingsWindow.loadURL('file://' + path.join(__dirname, '/../views/settings.html'));
  }

  show() {
    this.settingsWindow.show();
    this.isShown = true;
  }

  hide() {
    this.settingsWindow.hide();
    this.isShown = false;
  }
}

module.exports = SettingsWindow;
